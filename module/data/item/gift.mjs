import DieRpgItemBase from './base.mjs';
import { upgradesArrayField, specialsArrayField } from '../helpers.mjs';

/**
 * Data model for Gift items.
 * Used by Neos - represents Gifts of the Fair with upgrades.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgGift extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Gift',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.activated = new fields.BooleanField({
      required: true,
      initial: false,
      label: 'DIE_RPG.Item.Gift.FIELDS.activated.label',
      hint: 'DIE_RPG.Item.Gift.FIELDS.activated.hint'
    });

    // Upgrades - Can be picked multiple times
    // Only one upgrade marked Defensive unless advancement says otherwise
    schema.upgrades = upgradesArrayField();

    return schema;
  }

  /**
   * Prepare derived data for the Gift.
   * Calculates totals from upgrades.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Calculate total defense from all upgrades
    this.totalDefense = this.upgrades.reduce((sum, upgrade) => {
      return sum + (upgrade.defenseBonus || 0);
    }, 0);

    // Calculate total guard (same as defense for now)
    this.totalGuard = this.totalDefense;

    // Aggregate all specials from upgrades
    this.derivedSpecials = [];
    for (const upgrade of this.upgrades) {
      if (upgrade.specials && upgrade.specials.length > 0) {
        this.derivedSpecials.push(...upgrade.specials);
      }
    }
  }
}
