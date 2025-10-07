import DieRpgItemBase from './base.mjs';
import { specialsArrayField } from '../helpers.mjs';

/**
 * Data model for Stance items.
 * Used by Emotion Knights - represents combat/social/emotion stances.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgStance extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Stance',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.active = new fields.BooleanField({
      required: true,
      initial: false,
      label: 'DIE_RPG.Item.Stance.FIELDS.active.label',
      hint: 'DIE_RPG.Item.Stance.FIELDS.active.hint'
    });

    schema.stanceType = new fields.StringField({
      required: true,
      blank: false,
      initial: 'COMBAT',
      choices: ['COMBAT', 'SOCIAL', 'EMOTION'],
      label: 'DIE_RPG.Item.Stance.FIELDS.stanceType.label',
      hint: 'DIE_RPG.Item.Stance.FIELDS.stanceType.hint'
    });

    // Emotion subtype - only relevant for EMOTION stance type
    // 8 emotions: ECSTASY/JOY/SERENITY, GRIEF/SADNESS/PENSIVENESS, etc.
    schema.emotionSubtype = new fields.StringField({
      required: false,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Stance.FIELDS.emotionSubtype.label',
      hint: 'DIE_RPG.Item.Stance.FIELDS.emotionSubtype.hint'
    });

    // Specials - Special abilities activated with 6+ rolls
    schema.specials = specialsArrayField({
      label: 'DIE_RPG.Item.Stance.FIELDS.specials.label'
    });

    return schema;
  }
}
