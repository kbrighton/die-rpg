export async function rollStat(dataset, actor) {
  let label = dataset.label;
  let statName = dataset.statName;
  let statValue = actor.system.stats[statName].value;

  // Get Class Die info from Actor
  const classItem = actor?._getClassDieItem();
  const classDieType = classItem?.system?.classDie || null; // Get die type (e.g., "d8") or null

  // Define initial mods before dialog
  const initialAdvantages = 0; // Placeholder for context-based advantages
  const initialDisadvantages = 0; // Placeholder for context-based disadvantages

  // Show dialog to get modifiers
  const rollModifiers = await _showRollDialog({
    statName: label,
    initialStatValue: statValue,
    classDieType: classDieType, // Pass the die type string
    initialAdvantages: initialAdvantages, // Pass initial values
    initialDisadvantages: initialDisadvantages // Pass initial values
  });

  // If dialog is cancelled, stop the roll
  if (!rollModifiers) return null;

  const { advantages, disadvantages, difficulty, addClassDie } = rollModifiers;
 
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
    isMixedPool // Pass flag indicating if it was a mixed roll (1d6+1dX)
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
 * @returns {Promise<object|null>} A promise resolving to the modifier object or null if cancelled.
 */
async function _showRollDialog({ statName, initialStatValue, classDieType, initialAdvantages = 0, initialDisadvantages = 0 }) {
  const template = "systems/die-rpg/templates/dialog/roll-modifiers.hbs";

  // Calculate preliminary pool size based on initial mods to determine dialog state
  const preliminaryPoolSize = initialStatValue + initialAdvantages - initialDisadvantages;
  const isZeroPool = preliminaryPoolSize <= 0;

  const templateData = {
    classDieType: classDieType,
    isZeroPool: isZeroPool // Pass flag to template
  };
  const title = `Roll ${statName} (Base: ${initialStatValue}d6)`;

  // Render the template content first
  const htmlContent = await renderTemplate(template, templateData);

  const dicePool = await foundry.applications.api.DialogV2.wait({
    window: { title },
    content: htmlContent,
    modal: true,
    buttons: [
      {
        key: "roll",
        icon: "fas fa-dice-d6",
        label: "Roll",
        action: "roll",
        callback: (event, button, dialog) => new FormDataExtended(button.form)
      }
    ],
    rejectClose: false
  });

  if (!dicePool) return null; // Cancelled or closed
  return {
    advantages: parseInt(dicePool.object.advantages) || 0,
    disadvantages: parseInt(dicePool.object.disadvantages) || 0,
    difficulty: parseInt(dicePool.object.difficulty) || 0,
    addClassDie: dicePool.object.addClassDie === "true"
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
 */
function _buildChatRollMessage(roll, label, actor, results) {
  const { statValue, advantages, disadvantages, difficulty, initialSuccesses, finalSuccesses, specialDice, isCriticalFail, diceResults } = results;
  const poolSize = advantages - disadvantages + statValue; // Calculate intended pool size for display
  const isZeroPool = poolSize <= 0;
  const isSubstituted = isZeroPool && addClassDie && classDieType && /^d(4|6|8|10|12|20)$/.test(classDieType); // Check if substitution happened

  // Build Dice HTML with styling
  const diceHTML = diceResults.map(r => {
    let classes = [];
    // Mark discarded die for kl1 rolls (which are only non-substituted zero pool rolls)
    if (isZeroPool && !isSubstituted && !r.active) classes.push('discarded');
    if (r.result >= 6) classes.push('special-die');
    else if (r.result >= 4) classes.push('success');
    if (r.result === 1) classes.push('critfail-die');
    return `<span class="${classes.join(' ')}">${r.result}</span>`;
  }).join(', ');

  // Build Result Text
  let resultText = "";
  if (isCriticalFail) {
    resultText = `<span style="color: red; font-weight: bold;">Critical Fail!</span> (0 Successes & a 1)`;
  } else if (finalSuccesses > 0) {
    resultText = `<span style="color: green; font-weight: bold;">Success!</span> (${finalSuccesses} Final Successes)`;
  } else {
    // Check for Failing Forward (initial successes > 0 but final <= 0)
    if (initialSuccesses > 0 && difficulty > 0) {
       resultText = `<span style="color: orange; font-weight: bold;">Fail Forward?</span> (Successes reduced by Difficulty)`;
    } else {
       resultText = `<span style="color: red; font-weight: bold;">Failure.</span> (0 Final Successes)`;
    }
  }

  // Build Message Content
  let messageContent = `
    <div class="die-rpg-roll"> {{!-- Add class for potential styling --}}
      <div><strong>Rolled ${label}</strong></div>
      <div>Pool: ${statValue} (Stat) + ${advantages} (Adv) - ${disadvantages} (Disadv) = ${poolSize}d6 ${poolSize <= 0 ? '(Roll 2d6kl1)' : ''}</div>
      <div>Dice: ${diceHTML}</div>
      <div>Initial Successes (>=4): ${initialSuccesses}</div>
      <div>Difficulty: ${difficulty}</div>
      <div><strong>Final Result: ${resultText}</strong></div>
      ${specialDice > 0 ? `<div>Specials Available (6s): ${specialDice}</div>` : ''}
    </div>
  `;

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: messageContent,
    rollMode: game.settings.get('core', 'rollMode'),
  });
}