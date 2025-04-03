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
    const system = item.system;

    // --- Determine if item is rollable and gather base parameters ---
    let isRollable = false;
    let relevantStat = null;
    let initialAdvantages = 0;
    let initialDisadvantages = 0;
    let baseDifficulty = 0;
    let forceAddClassDie = false;

    if (item.type === 'gear') {
      // Basic Gear might not have a roll, but weapons/tools often do.
      // TODO: Refine Gear stat based on weapon properties (e.g., Rapier uses DEX)
      relevantStat = 'str'; // Default for now
      isRollable = true; // Assume gear with roll mods is rollable
      if (system.rollModType === 'advantage') initialAdvantages = system.rollModValue || 1; // Assume 1 if value missing
      if (system.rollModType === 'disadvantage') initialDisadvantages = system.rollModValue || 1;
      // 'add_dice' handled by roll helper based on adv/disadv values
    } else if (item.type === 'ability') {
      if (system.roll?.stat) {
        relevantStat = system.roll.stat;
        isRollable = true;
        initialAdvantages = system.roll.fixed_adv || 0;
        initialDisadvantages = system.roll.fixed_disadv || 0;
        baseDifficulty = system.roll.base_difficulty || 0;
        forceAddClassDie = system.roll.add_class_die || false;
      } else if (system.isAttack || system.isSpellAttack) {
        // Default attack stat if not specified in roll object? Needs rules clarification.
        // For now, assume CHA for spell attacks, STR for others if no stat given.
        relevantStat = system.isSpellAttack ? 'cha' : 'str'; // Placeholder default
        isRollable = true;
      }
    }
    // Other types ('feature', 'class', 'persona') are not directly rollable via this method

    // --- If not rollable, output description ---
    if (!isRollable || !relevantStat) {
      ChatMessage.create({
        speaker: speaker,
        flavor: label,
        content: system.description ?? '',
      });
      return;
    }

    // --- Check Actor and Stat ---
    if (!this.actor || !this.actor.system.stats[relevantStat]) {
      ui.notifications.warn(`Actor does not have the required stat (${relevantStat}) for this item roll.`);
      return;
    }

    // --- Prepare dataset for the rollStat helper ---
    const dataset = {
      label: label,
      statName: relevantStat,
      // Pass initial modifiers from the item
      advantages: initialAdvantages,
      disadvantages: initialDisadvantages,
      difficulty: baseDifficulty,
      addClassDie: forceAddClassDie, // Use item's flag
    };

    // --- Call the roll helper ---
    return rollStat(dataset, this.actor);
  }
}
