import DieRpgItemBase from './base.mjs';

/**
 * Data model for Arcane Weapon items.
 * Used by Emotion Knights - represents THE ARCANE WEAPON.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgArcaneWeapon extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.ArcaneWeapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.weaponType = new fields.StringField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.ArcaneWeapon.FIELDS.weaponType.label',
      hint: 'DIE_RPG.Item.ArcaneWeapon.FIELDS.weaponType.hint'
    });

    schema.personality = new fields.StringField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.ArcaneWeapon.FIELDS.personality.label',
      hint: 'DIE_RPG.Item.ArcaneWeapon.FIELDS.personality.hint'
    });

    return schema;
  }
}
