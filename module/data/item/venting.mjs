import DieRpgItemBase from './base.mjs';

/**
 * Data model for Venting items.
 * Used by Emotion Knights to vent emotions.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgVenting extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Venting',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.active = new fields.BooleanField({
      required: true,
      initial: false,
      label: 'DIE_RPG.Item.Venting.FIELDS.active.label',
      hint: 'DIE_RPG.Item.Venting.FIELDS.active.hint'
    });

    return schema;
  }
}
