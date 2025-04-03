import DieRpgItemBase from './base-item.mjs';

export default class DieRpgGear extends DieRpgItemBase { // Changed class name for clarity
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Gear',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema(); // Inherits description

    schema.quantity = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
      label: 'DIE_RPG.Item.Gear.FIELDS.quantity.label'
    });
    schema.weight = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.Gear.FIELDS.weight.label'
    });

    // Removed schema.roll and schema.formula

    // --- Added fields for DIE RPG Gear ---

    schema.defenseBonus = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.Gear.FIELDS.defenseBonus.label' // Assuming localization key
    });

    // How does this gear modify rolls?
    schema.rollModType = new fields.StringField({
      required: false,
      blank: true,
      initial: 'none', // Options: 'none', 'advantage', 'disadvantage', 'add_dice'
      label: 'DIE_RPG.Item.Gear.FIELDS.rollModType.label' // Assuming localization key
      // TODO: Could use StringField({ choices: [...] }) for validation
    });

    schema.rollModValue = new fields.NumberField({
      required: false,
      nullable: true, // Nullable if type is 'none'
      integer: true,
      initial: null,
      label: 'DIE_RPG.Item.Gear.FIELDS.rollModValue.label' // Assuming localization key
    });

    schema.specialText = new fields.StringField({ // Text for the Special triggered on a 6+
      required: false,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Gear.FIELDS.specialText.label' // Assuming localization key
    });

    return schema;
  }

  // Removed prepareDerivedData method that calculated the old formula
}
