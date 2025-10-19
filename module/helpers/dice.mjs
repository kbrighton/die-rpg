export async function rollStat(dataset, actor) {
  let label = dataset.label;
  let statName = dataset.statName;
  let statValue = actor.system.stats[statName].value;

  // Use the new actor helper method for smart filtering
  const availableSpecials = actor.getAvailableSpecials({
    equipped: true,
    active: true,
    paragon: true,
    abilityId: dataset.abilityId || null
  });

  // Merge with any specials passed from item context (if applicable)
  if (dataset.availableSpecials && Array.isArray(dataset.availableSpecials)) {
    const specialKeys = new Set(availableSpecials.map(s => `${s.source}-${s.name}`));
    dataset.availableSpecials.forEach(s => {
      const identifier = `${s.source}-${s.name}`;
      if (!specialKeys.has(identifier)) {
        availableSpecials.push(s);
        specialKeys.add(identifier);
      }
    });
  }


  // Get Class Die info from Actor
  const classItem = await actor?._getClassDieItem();
  const classDieType = classItem?.system?.die || null; // Get die type (e.g., "d8") or null

  // Debug logging
  console.log('DIE RPG | Class Item:', classItem);
  console.log('DIE RPG | Class Die Type:', classDieType);

  // Define initial mods before dialog, using values from dataset if provided
  const initialAdvantages = dataset.advantages || 0;
  const initialDisadvantages = dataset.disadvantages || 0;
  // TODO: Consider passing dataset.difficulty as initialDifficulty to dialog as well?

  // Show dialog to get modifiers
  const rollModifiers = await _showRollDialog({
    statName: label,
    initialStatValue: statValue,
    classDieType: classDieType, // Pass the die type string
    initialAdvantages: initialAdvantages, // Pass initial values
    initialDisadvantages: initialDisadvantages, // Pass initial values
    actor: actor // Pass actor for flashback tracking
  });

  // If dialog is cancelled, stop the roll
  if (!rollModifiers) return null;

  const { advantages, disadvantages, difficulty, addClassDie, flashbackUsed } = rollModifiers;

  // Update actor's flashback state if it was used
  if (flashbackUsed && actor && !actor.system.flashbackUsed) {
    await actor.update({ 'system.flashbackUsed': true });
  }
 
  // Pass classDieType to _rollDicePool
  let roll = _rollDicePool(statValue, advantages, disadvantages, addClassDie, classDieType);
  await roll.evaluate();

  // Count successes (results >= 4) and gather results
  let successCount = 0;
  let diceResults = [];
  let isMixedPool = false; // Flag for 1d6 + 1dX rolls

  // Use correct namespace: foundry.dice.terms.Die
  if (roll.dice.length > 0 && roll.dice[0] instanceof foundry.dice.terms.Die) {
    // Standard d6 pool or 2d6kl1
    diceResults = roll.dice[0].results;
    successCount = diceResults.filter(r => r.active && r.result >= 4).length; // Count only active dice
  }
  else if (roll.terms.length > 1 && roll.terms[0] instanceof foundry.dice.terms.Die && roll.terms[2] instanceof foundry.dice.terms.Die) {
    // Handle mixed pool like 1d6 + 1d8
    isMixedPool = true;
    const results1 = roll.terms[0].results;
    const results2 = roll.terms[2].results;
    diceResults = [...results1, ...results2]; // Combine results from both terms
    // In mixed pool, both dice count for success (no keep lowest logic here)
    successCount = diceResults.filter(r => r.result >= 4).length;
    // TODO: Need logic to determine which die is "kept" if substitution rule applies for <=0 pool
  }

  // Apply difficulty reduction
  const finalSuccesses = Math.max(0, successCount - difficulty);

  // Handle Specials on 6s
  const specialDice = diceResults.filter(r => r.active && r.result >= 6).length; // Count active dice >= 6

  // Handle Critical Fail (0 final successes and at least one 1 rolled)
  const hasCritFailDie = diceResults.some(r => r.active && r.result === 1);
  const isCriticalFail = (finalSuccesses === 0 && hasCritFailDie);

  _buildChatRollMessage(roll, label, actor, { // Pass results object
    statValue, // Pass base stat value
    advantages, // Pass advantages used
    disadvantages, // Pass disadvantages used
    difficulty,
    initialSuccesses: successCount,
    finalSuccesses,
    specialDice,
    isCriticalFail,
    diceResults,
    classDieType, // Pass the type of class die used
    isMixedPool, // Pass flag indicating if it was a mixed roll (1d6+1dX)
    availableSpecials // Pass the intelligently filtered list of specials
  });

  return roll; // Return the original Roll object for potential further use
}

/**
 * Shows a dialog window using DialogV2 to configure roll modifiers.
 * @param {object} options
 * @param {string} options.statName Name of the stat being rolled.
 * @param {number} options.initialStatValue Initial value of the stat.
 * @param {string|null} options.classDieType The type of class die available (e.g., "d8") or null.
 * @param {number} options.initialAdvantages Initial advantages before dialog input.
 * @param {number} options.initialDisadvantages Initial disadvantages before dialog input.
 * @param {Actor} options.actor The actor performing the roll (for flashback tracking).
 * @returns {Promise<object|null>} A promise resolving to the modifier object or null if cancelled.
 */
async function _showRollDialog({ statName, initialStatValue, classDieType, initialAdvantages = 0, initialDisadvantages = 0, actor }) {
  const template = "systems/die-rpg/templates/dialog/roll-modifiers.hbs";

  // Calculate preliminary pool size based on initial mods to determine dialog state
  const preliminaryPoolSize = initialStatValue + initialAdvantages - initialDisadvantages;
  const isZeroPool = preliminaryPoolSize <= 0;

  const templateData = {
    classDieType: classDieType,
    isZeroPool: isZeroPool,
    initialAdvantages: initialAdvantages || 0,
    initialDisadvantages: initialDisadvantages || 0,
    initialStatValue: initialStatValue,
    flashbackUsed: actor?.system?.flashbackUsed || false
  };

  // Debug logging
  console.log('DIE RPG | Roll Dialog Template Data:', templateData);

  const title = `Roll ${statName} (Base: ${initialStatValue}d6)`;

  // Render the template content first
  const htmlContent = await foundry.applications.handlebars.renderTemplate(template, templateData);

  const dicePool = await foundry.applications.api.DialogV2.wait({
    classes: ['die-rpg'],
    window: { title },
    content: htmlContent,
    modal: true,
    buttons: [
      {
        key: "roll",
        icon: "fas fa-dice-d6",
        label: "Roll",
        action: "roll",
        callback: (event, button, dialog) => new foundry.applications.ux.FormDataExtended(button.form)
      }
    ],
    rejectClose: false,
    render: (event, element) => {
      // Use setTimeout to ensure DOM is fully populated
      setTimeout(() => {
        // Try multiple approaches to get the dialog element
        const dialogElement = event.target?.element || document.querySelector('dialog[open]');

        if (!dialogElement || typeof dialogElement.querySelectorAll !== 'function') {
          console.error('DIE RPG | Could not access dialog element', dialogElement);
          return;
        }

        // Initialize pool calculation
        const updatePoolDisplay = () => {
          const advInput = dialogElement.querySelector('input[name="advantages"]');
          const disadvInput = dialogElement.querySelector('input[name="disadvantages"]');
          const flashbackCheck = dialogElement.querySelector('#useFlashback');
          const classDieCheck = dialogElement.querySelector('#addClassDie');

          let advantages = parseInt(advInput?.value || 0);
          const disadvantages = parseInt(disadvInput?.value || 0);

          // Add 1 to advantages if flashback is checked
          if (flashbackCheck?.checked) {
            advantages += 1;
          }

          const poolSize = initialStatValue + advantages - disadvantages;
          const poolBadgesContainer = dialogElement.querySelector('#pool-badges');
          const warningDiv = dialogElement.querySelector('#zero-pool-warning');

          // Update badge display
          if (poolBadgesContainer) {
            const baseBadge = poolBadgesContainer.querySelector('#base-pool-badge');
            if (baseBadge) {
              baseBadge.textContent = `${poolSize}d6`;
            }

            // Handle class die badge
            let classDieBadge = poolBadgesContainer.querySelector('#class-die-badge');
            if (classDieCheck?.checked && classDieType) {
              // Create or update class die badge
              if (!classDieBadge) {
                classDieBadge = document.createElement('span');
                classDieBadge.id = 'class-die-badge';
                classDieBadge.className = 'dice-badge class-die';
                poolBadgesContainer.appendChild(classDieBadge);
              }
              classDieBadge.textContent = `+1${classDieType}`;
              classDieBadge.style.display = '';
            } else if (classDieBadge) {
              // Hide class die badge if not checked
              classDieBadge.style.display = 'none';
            }
          }

          // Show/hide warning for zero pool
          if (warningDiv) {
            if (poolSize <= 0) {
              warningDiv.style.display = 'block';
            } else {
              warningDiv.style.display = 'none';
            }
          }
        };

        // Set up event listeners for number spinner buttons
        const spinnerButtons = dialogElement.querySelectorAll('.number-spinner-btn');
        spinnerButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = button.dataset.action;
            const name = button.dataset.name;
            const input = dialogElement.querySelector(`input[name="${name}"]`);

            if (!input) return;

            // Parse min/max, handling empty strings that return NaN
            const minParsed = parseInt(input.min);
            const min = isNaN(minParsed) ? 0 : minParsed;

            const maxParsed = parseInt(input.max);
            const max = isNaN(maxParsed) ? Infinity : maxParsed;

            // More careful parsing - don't reset to 0 on every NaN
            let currentValue;
            const inputVal = input.value;

            if (inputVal === '' || inputVal === null || inputVal === undefined) {
              currentValue = min; // Use minimum value for empty inputs
            } else {
              currentValue = parseInt(inputVal);
              // Only reset if parsing truly failed
              if (isNaN(currentValue)) {
                console.warn('DIE RPG | Invalid input value:', inputVal);
                currentValue = min;
              }
            }

            // Increment or decrement
            if (action === 'increment') {
              currentValue = Math.min(max, currentValue + 1);
            } else if (action === 'decrement') {
              currentValue = Math.max(min, currentValue - 1);
            }

            // Ensure final value is valid and update input
            if (isNaN(currentValue)) currentValue = 0;
            input.value = String(currentValue);

            // Update pool display
            updatePoolDisplay();
          });
        });

        // Set up change listeners on number inputs for manual entry
        const numberInputs = dialogElement.querySelectorAll('.number-spinner-input');
        numberInputs.forEach(input => {
          input.addEventListener('change', () => {
            // Enforce min/max on manual input (handle NaN from empty strings)
            const minParsed = parseInt(input.min);
            const min = isNaN(minParsed) ? 0 : minParsed;

            const maxParsed = parseInt(input.max);
            const max = isNaN(maxParsed) ? Infinity : maxParsed;

            let value = parseInt(input.value);
            if (isNaN(value) || input.value === '' || input.value === null) {
              value = 0;
            }
            value = Math.max(min, Math.min(max, value));
            input.value = String(value);

            // Update pool display
            updatePoolDisplay();
          });

          // Initialize input value if empty
          if (input.value === '' || input.value === null || input.value === undefined) {
            input.value = '0';
          }
        });

        // Set up flashback checkbox listener
        const flashbackCheck = dialogElement.querySelector('#useFlashback');
        if (flashbackCheck) {
          flashbackCheck.addEventListener('change', () => {
            updatePoolDisplay();
          });
        }

        // Listen to class die checkbox changes
        const classDieCheck = dialogElement.querySelector('#addClassDie');
        if (classDieCheck) {
          classDieCheck.addEventListener('change', () => {
            updatePoolDisplay();
          });
        }

        // Initial pool calculation
        updatePoolDisplay();
      }, 0);
    }
  });

  if (!dicePool) return null; // Cancelled or closed

  // Calculate final advantages (including flashback if used)
  let finalAdvantages = parseInt(dicePool.object.advantages) || 0;
  const flashbackUsed = dicePool.object.useFlashback === 'on';
  if (flashbackUsed) {
    finalAdvantages += 1;
  }

  return {
    advantages: finalAdvantages,
    disadvantages: parseInt(dicePool.object.disadvantages) || 0,
    difficulty: parseInt(dicePool.object.difficulty) || 0,
    addClassDie: dicePool.object.addClassDie === "true",
    flashbackUsed: flashbackUsed
  };
}


/**
 * Creates a Roll object based on stat value, advantages, and disadvantages.
 * Handles the <= 0 dice rule.
 * @param {number} statValue Base number of dice
 * @param {number} advantages Number of advantage dice
 * @param {number} disadvantages Number of disadvantage dice
 * @param {boolean} addClassDie Whether to add a class die.
 * @param {string|null} classDieType The type of class die (e.g., "d8") or null.
 * @returns {Roll} The Roll object.
 */
function _rollDicePool(statValue, advantages = 0, disadvantages = 0, addClassDie = false, classDieType = null){
  let poolSize = statValue + advantages - disadvantages;

  let rollFormula;
  if (poolSize <= 0) {
    // If pool is 0 or less, roll 2d6kl1 OR 1d6 + Class Die if substituted
    if (addClassDie && classDieType && /^d(4|6|8|10|12|20)$/.test(classDieType)) {
      // TODO: Dialog needs modification to *only* offer substitution in this case.
      // Assuming checkbox means substitution for now.
      rollFormula = `1d6 + 1${classDieType}`; // Roll separately
    } else {
      rollFormula = "2d6kl1"; // Default for <=0 pool
    }
  } else {
    rollFormula = `${poolSize}d6`;
    // Add class die if requested and available
    if (addClassDie && classDieType) {
      // Validate classDieType format (simple check)
      if (/^d(4|6|8|10|12|20)$/.test(classDieType)) {
         rollFormula += ` + 1${classDieType}`;
      } else {
        console.warn(`DIE RPG | Invalid classDieType format: ${classDieType}. Ignoring.`);
      }
    }
  }

  let r = new Roll(rollFormula);
  return r;
}

/**
 * Builds and sends the chat message for the roll result.
 * @param {Roll} roll The evaluated Roll object.
 * @param {string} label The label for the roll (e.g., stat name).
 * @param {Actor} actor The actor performing the roll.
 * @param {object} results An object containing calculated roll results.
 * @param {number} results.statValue The base stat value used.
 * @param {number} results.advantages The number of advantages applied.
 * @param {number} results.disadvantages The number of disadvantages applied.
 * @param {number} results.difficulty The difficulty set for the roll.
 * @param {number} results.initialSuccesses Successes before difficulty.
 * @param {number} results.finalSuccesses Successes after difficulty.
 * @param {number} results.specialDice Count of dice >= 6.
 * @param {boolean} results.isCriticalFail Whether the roll was a critical fail.
 * @param {Array<object>} results.diceResults The individual dice results.
 * @param {string|null} results.classDieType The type of class die used, if any.
 * @param {boolean} results.isMixedPool Whether the roll was a mixed pool (1d6 + 1dX).
 * @param {Array<object>} results.availableSpecials Placeholder for specials relevant to this roll.
 */
function _buildChatRollMessage(roll, label, actor, results) {
  const { statValue, advantages, disadvantages, difficulty, initialSuccesses, finalSuccesses, specialDice, isCriticalFail, diceResults, classDieType, isMixedPool, availableSpecials } = results;
  const calculatedPoolSize = advantages - disadvantages + statValue; // Calculate intended pool size for display
  const isZeroPool = calculatedPoolSize <= 0;
  // Substitution occurs if pool was <=0 AND addClassDie was true AND a valid classDieType exists
  const isSubstituted = isZeroPool && results.addClassDie && classDieType;

  // Build Dice HTML with styling
  const diceHTML = diceResults.map((r, index) => {
    let classes = [];
    let dieLabel = '';
    // Mark discarded die for kl1 rolls (which are only non-substituted zero pool rolls)
    if (isZeroPool && !isSubstituted && !r.active) {
        classes.push('discarded');
    }
    // Label dice in mixed pools
    if (isMixedPool) {
        dieLabel = (index === 0) ? '(d6)' : `(${classDieType || 'Class'})`;
    }

    if (r.result >= 6) classes.push('special-die');
    else if (r.result >= 4) classes.push('success');
    if (r.result === 1) classes.push('critfail-die');
    return `<span class="${classes.join(' ')}">${r.result} ${dieLabel}</span>`;
  }).join(', ');

  // Build Result Text
  let resultText = "";
  if (isCriticalFail) {
    resultText = `<span style="color: red; font-weight: bold;">Critical Fail!</span> (0 Successes & a 1)`;
  } else if (finalSuccesses > 0) {
    resultText = `<span style="color: green; font-weight: bold;">Success!</span> (${finalSuccesses} Final Successes)`;
  } else {
    // Check for Failing Forward (initial successes > 0 but final <= 0 due to difficulty)
    // Only apply if the setting is enabled
    const useFailingForward = game.settings.get('die-rpg', 'enableFailingForward');
    if (useFailingForward && initialSuccesses > 0 && difficulty >= initialSuccesses) {
       // More explicit Fail Forward message
       resultText = `<span style="color: orange; font-weight: bold;">Fail Forward!</span> (${initialSuccesses} successes vs Difficulty ${difficulty}. Action succeeds with cost or complication - GM narrates.)`;
    } else {
       // Standard failure (or Failing Forward disabled)
       resultText = `<span style="color: red; font-weight: bold;">Failure.</span> (0 Final Successes)`;
    }
  }

  // Build Message Content
  // Build Message Content
  let poolDescription = `${statValue} (Stat) + ${advantages} (Adv) - ${disadvantages} (Disadv)`;
  if (results.addClassDie && classDieType && !isSubstituted) poolDescription += ` + 1${classDieType}`;
  poolDescription += ` = ${calculatedPoolSize <= 0 ? '0' : calculatedPoolSize}d6`;
  if (isSubstituted) poolDescription += ` (Substituted Class Die: 1d6 + 1${classDieType})`;
  else if (isZeroPool) poolDescription += ` (Roll 2d6kl1)`;


  let messageContent = `
    <div class="die-rpg-roll"> {{!-- Add class for potential styling --}}
      <div><strong>Rolled ${label}</strong></div>
      <div>Pool: ${poolDescription}</div>
      <div>Dice: ${diceHTML}</div>
      <div>Initial Successes (>=4): ${initialSuccesses}</div>
      <div>Difficulty: ${difficulty}</div>
      <div><strong>Final Result: ${resultText}</strong></div>
      ${specialDice > 0 ? `<div>Specials Available (6s rolled): ${specialDice}</div>` : ''}
      ${_buildSpecialsHTML(actor, availableSpecials, specialDice)} {{!-- Add Specials buttons/links --}}
    </div>
  `;

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: messageContent,
    rollMode: game.settings.get('core', 'rollMode'),
  });
}

/**
 * Generates HTML for clickable special activation buttons.
 * @param {Actor} actor The actor who rolled.
 * @param {Array<object>} availableSpecials List of potential specials.
 * @param {number} specialDiceCount Number of 6s rolled.
 * @returns {string} HTML string for special buttons.
 * @private
 */
function _buildSpecialsHTML(actor, availableSpecials, specialDiceCount) {
  if (!availableSpecials || availableSpecials.length === 0 || specialDiceCount === 0) {
    return '';
  }

  // Filter specials that can be afforded with the rolled 6s
  const affordableSpecials = availableSpecials.filter(s => specialDiceCount >= CONFIG.DIE_RPG.getSpecialCostValue(s.cost));

  if (affordableSpecials.length === 0) {
    return '';
  }

  // Sort specials: Mandatory first, then by cost, then by name
  affordableSpecials.sort((a, b) => {
    if (a.mandatory !== b.mandatory) {
      return a.mandatory ? -1 : 1; // Mandatory first
    }
    const costA = CONFIG.DIE_RPG.getSpecialCostValue(a.cost);
    const costB = CONFIG.DIE_RPG.getSpecialCostValue(b.cost);
    if (costA !== costB) {
      return costA - costB; // Lower cost first
    }
    return (a.name || '').localeCompare(b.name || ''); // Alphabetical by name
  });

  let html = '<div class="specials-list"><strong>Available Specials:</strong><ul>';

  affordableSpecials.forEach(special => {
    const cost = CONFIG.DIE_RPG.getSpecialCostValue(special.cost);
    const name = special.name || 'Unnamed Special';
    const description = special.description || '';
    const mandatoryText = special.mandatory ? ' <strong style="color:orange;">(Mandatory)</strong>' : '';

    // Just list the special for now, interaction deferred
    html += `
      <li title="${description}">
         <i class="fas fa-star"></i> ${name} (Cost: ${cost})${mandatoryText}
      </li>
    `;
  });

  html += '</ul></div>';
  return html;
}