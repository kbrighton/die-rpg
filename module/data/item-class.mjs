import DieRpgItemBase from './base-item.mjs';

/**
 * Data model for Class items.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgClass extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Class', // Assuming this localization path
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema(); // Inherits description

    // Define fields specific to Class items
    schema.classDie = new fields.StringField({
      required: true,
      blank: false,
      initial: 'd6', // Default class die? Needs confirmation.
      label: 'DIE_RPG.Item.Class.FIELDS.classDie.label' // Assuming localization key
      // TODO: Add validation for valid die types (d4, d6, d8, d10, d12, d20)?
    });

    // TODO: Add fields for class features/abilities granted, advancement tracks, etc.
    // schema.grantedFeatures = new fields.ArrayField(new fields.SchemaField({...}));
    // schema.advancement = new fields.SchemaField({...});

    return schema;
  }

  // prepareDerivedData() {
  //   super.prepareDerivedData();
  // }

  // getRollData() {
  //   const data = super.getRollData();
  //   return data;
  // }
}