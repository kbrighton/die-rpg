import DieRpgItemBase from './base.mjs';
import { specialsArrayField } from '../helpers.mjs';

export default class DieRpgEquipment extends DieRpgItemBase { // Changed class name for clarity
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Equipment',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
      label: 'DIE_RPG.Item.Equipment.FIELDS.quantity.label'
    });
    schema.weight = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.Equipment.FIELDS.weight.label'
    });

    // Removed schema.roll and schema.formula

    // --- Added fields for DIE RPG Equipment ---

    schema.defenseBonus = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.Equipment.FIELDS.defenseBonus.label' // Assuming localization key
    });

    // How does this equipment modify rolls?
    schema.rollModType = new fields.StringField({
      required: false,
      blank: true,
      initial: 'none', // Options: 'none', 'advantage', 'disadvantage', 'add_dice'
      label: 'DIE_RPG.Item.Equipment.FIELDS.rollModType.label' // Assuming localization key
      // TODO: Could use StringField({ choices: [...] }) for validation
    });

    schema.rollModValue = new fields.NumberField({
      required: false,
      nullable: true, // Nullable if type is 'none'
      integer: true,
      initial: null,
      label: 'DIE_RPG.Item.Equipment.FIELDS.rollModValue.label' // Assuming localization key
    });

    // Structured field for Specials
    schema.specials = specialsArrayField({ label: 'DIE_RPG.Item.Equipment.FIELDS.specials.label' });

    return schema;
  }

  // Removed prepareDerivedData method that calculated the old formula
}
