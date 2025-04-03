export async function rollStat(dataset, actor) {
  let label = dataset.label;
  let statName = dataset.statName;
  let statValue = actor.system.stats[statName].value;

  // Show dialog to get modifiers
  const rollModifiers = await _showRollDialog({
    statName: label, // Pass stat name for dialog title
    initialStatValue: statValue,
    // TODO: Pass available class die info from actor
  });

  // If dialog is cancelled, stop the roll
  if (!rollModifiers) return null;

  const { advantages, disadvantages, difficulty, addClassDie } = rollModifiers;

  let roll = _rollDicePool(statValue, advantages, disadvantages, addClassDie);
  await roll.evaluate();

  // Count successes (results >= 4)
  let successCount = 0;
  let diceResults = [];
  if (roll.dice.length > 0) {
    diceResults = roll.dice[0].results;
    successCount = diceResults.filter(r => r.result >= 4).length;
  } else if (roll.terms[0] instanceof Die && roll.terms[0].results.length > 0) {
    // Handle case for 2d6kl1 where results are directly on the Die term
    diceResults = roll.terms[0].results;
     // For kl1, only the kept die counts for success
    successCount = diceResults.filter(r => r.active && r.result >= 4).length;
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
    diceResults
  });

  return roll; // Return the original Roll object for potential further use
}

/**
 * Shows a dialog window using DialogV2 to configure roll modifiers.
 * @param {object} options
 * @param {string} options.statName Name of the stat being rolled.
 * @param {number} options.initialStatValue Initial value of the stat.
 * @returns {Promise<object|null>} A promise resolving to the modifier object or null if cancelled.
 */
async function _showRollDialog({ statName, initialStatValue }) {
  const template = "systems/die-rpg/templates/dialog/roll-modifiers.hbs";
  // TODO: Pass classDieType and the stat number to the template data if available
  const templateData = {
    // classDieType: actor.getClassDie()?.formula || "N/A"
    // statName: statName,
    // statValue: initialStatValue,
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
 * @param {boolean} addClassDie Whether to add a class die (future implementation)
 * @returns {Roll} The Roll object.
 */
function _rollDicePool(statValue, advantages = 0, disadvantages = 0, addClassDie = false){
  let poolSize = statValue + advantages - disadvantages; // This line uses the incorrect 0 values
  // TODO: Add Class Die logic if addClassDie is true

  let rollFormula;
  if (poolSize <= 0) {
    // Roll 2d6 keep lowest 1
    // TODO: Handle Class Die substitution option
    rollFormula = "2d6kl1";
  } else {
    rollFormula = `${poolSize}d6`;
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
  console.log("Roll Results:", results); // Debugging line to check results
  const { statValue, advantages, disadvantages, difficulty, initialSuccesses, finalSuccesses, specialDice, isCriticalFail, diceResults } = results;
  const poolSize = roll.terms[0]?.number ?? (roll.formula === "2d6kl1" ? 2 : 0); // Get actual pool size rolled

  // Build Dice HTML with styling
  const diceHTML = diceResults.map(r => {
    let classes = [];
    if (!r.active) classes.push('discarded'); // Handle kl1 discarded die
    if (r.result >= 6) classes.push('special-die'); // Special before success for priority
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