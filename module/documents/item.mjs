/**
import { rollStat } from '../helpers/dice.mjs'; // Import the refactored roll helper

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class DieRpgItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(event) {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode'); // Keep rollMode if needed for dialogs later
    const label = `[${item.type}] ${item.name}`;

    // Determine the relevant stat for the item roll
    // TODO: This needs proper implementation based on item type/data
    // For now, let's assume Gear uses STR, Features/Spells use CHA as placeholders
    let relevantStat = 'cha'; // Default placeholder
    if (item.type === 'gear') {
      relevantStat = 'str'; // Placeholder for gear
    }

    // Check if the actor has the relevant stat
    if (!this.actor || !this.actor.system.stats[relevantStat]) {
      ui.notifications.warn(`Actor does not have the required stat (${relevantStat}) for this item roll.`);
      // Optionally, still output description to chat
      ChatMessage.create({
        speaker: speaker,
        flavor: label,
        content: item.system.description ?? '',
      });
      return;
    }

    // Prepare dataset for the rollStat helper
    // TODO: Add logic to get advantages/disadvantages/difficulty from the item or context
    const dataset = {
      label: label,
      statName: relevantStat,
      // Placeholder values for now
      advantages: 0,
      disadvantages: 0,
      difficulty: 0,
      addClassDie: false, // Placeholder
    };

    // Call the refactored rollStat helper
    // The helper now handles dice pool calculation, rolling, success counting, and chat message creation
    return rollStat(dataset, this.actor);
  }
}
