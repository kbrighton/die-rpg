import DieRpgItemBase from './base.mjs';
import { specialsArrayField } from '../helpers.mjs';

/**
 * Data model for Spell items.
 * Represents spells and magical abilities with special triggers.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgSpell extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Spell',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Specials - Special abilities activated with 6+ rolls
    schema.specials = specialsArrayField({
      label: 'DIE_RPG.Item.Spell.FIELDS.specials.label'
    });

    return schema;
  }
}
