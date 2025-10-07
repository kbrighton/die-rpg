import DieRpgItemBase from './base.mjs';
import { scripturesArrayField } from '../helpers.mjs';

/**
 * Data model for God items.
 * Used by Godbinders - represents a bound god with scriptures/benefits.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgGod extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.God',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.title = new fields.StringField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.God.FIELDS.title.label',
      hint: 'DIE_RPG.Item.God.FIELDS.title.hint'
    });

    schema.level = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 1,
      label: 'DIE_RPG.Item.God.FIELDS.level.label'
    });

    schema.trust = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.God.FIELDS.trust.label'
    });

    schema.debt = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.God.FIELDS.debt.label'
    });

    // Scriptures/Benefits - Array of 3 benefits (but support adding more)
    schema.scriptures = scripturesArrayField({ initialCount: 3 });

    return schema;
  }
}
