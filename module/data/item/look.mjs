import DieRpgItemBase from './base.mjs';

/**
 * Data model for Look items.
 * Represents appearance/clothing options for characters.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgLook extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Look',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.defenseBonus = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.Look.FIELDS.defenseBonus.label'
    });

    return schema;
  }
}
