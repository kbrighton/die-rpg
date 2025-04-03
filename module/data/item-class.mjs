import DieRpgItemBase from './base-item.mjs';

/**
 * Data model for Class items.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgClass extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Class',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema(); // Inherits description

    // --- Core Class Fields ---
    schema.baseClassType = new fields.StringField({
      required: true,
      blank: false,
      initial: 'Dictator', // Default to one type
      choices: ['Dictator', 'Fool', 'Emotion Knight', 'Godbinder', 'Neo', 'Master'], // Define base types
      label: 'DIE_RPG.Item.Class.FIELDS.baseClassType.label'
    });

    schema.classDie = new fields.StringField({
      required: true,
      blank: false,
      initial: 'd6',
      label: 'DIE_RPG.Item.Class.FIELDS.classDie.label'
      // TODO: Add validation for valid die types (d4, d6, d8, d10, d12, d20)?
    });

    schema.abilities_text = new fields.HTMLField({
      required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.abilities_text.label'
    });

    schema.play_style_text = new fields.HTMLField({
      required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.play_style_text.label'
    });

    schema.core_mechanic_special = new fields.StringField({
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Class.FIELDS.core_mechanic_special.label'
    });

    schema.equipment_choices = new fields.HTMLField({
      required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.equipment_choices.label'
    });

    schema.look_choices = new fields.HTMLField({
      required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.look_choices.label'
    });

    schema.advancements_text = new fields.HTMLField({
      required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.advancements_text.label'
    });

    // --- Dictator Specific ---
    schema.dictator_emotion_palette = new fields.StringField({ required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Class.FIELDS.dictator_emotion_palette.label' });
    schema.dictator_tell = new fields.StringField({ required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Class.FIELDS.dictator_tell.label' });
    schema.dictator_performance_effect = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.dictator_performance_effect.label' });
    schema.dictator_performance_control = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.dictator_performance_control.label' });
    schema.dictator_performance_attack = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.dictator_performance_attack.label' });

    // --- Godbinder Specific ---
    schema.godbinder_contract = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.godbinder_contract.label' });
    schema.godbinder_scripture = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.godbinder_scripture.label' });
    schema.godbinder_debt = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.godbinder_debt.label' });
    schema.godbinder_miracles = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.godbinder_miracles.label' });

    // --- Neo Specific ---
    schema.neo_fair_gold = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.neo_fair_gold.label' });
    schema.neo_gifts = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.neo_gifts.label' });
    schema.neo_neotech = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.neo_neotech.label' });
    schema.neo_overcharge = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.neo_overcharge.label' });

    // --- Fool Specific ---
    schema.fool_trade = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.fool_trade.label' });
    schema.fool_flukes = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.fool_flukes.label' });
    schema.fool_if_all_else_fails = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.fool_if_all_else_fails.label' });

    // --- Emotion Knight Specific ---
    schema.ek_sacred_emotion = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.ek_sacred_emotion.label' });
    schema.ek_arcane_weapon_types = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.ek_arcane_weapon_types.label' });
    schema.ek_arcane_weapon_personality = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.ek_arcane_weapon_personality.label' });
    schema.ek_arcane_weapon_main_trait = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.ek_arcane_weapon_main_trait.label' });
    schema.ek_emotional_scale = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.ek_emotional_scale.label' });
    schema.ek_creative_violence = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.ek_creative_violence.label' });

    // --- Master Specific ---
    schema.master_cheating = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.master_cheating.label' });
    schema.master_rules = new fields.HTMLField({ required: false, blank: true, label: 'DIE_RPG.Item.Class.FIELDS.master_rules.label' });

    // --- Advancement Structure ---
    const advancementOptionSchema = new fields.SchemaField({
      name: new fields.StringField({ required: true, blank: false }),
      description: new fields.HTMLField({ required: false, blank: true }),
      type: new fields.StringField({ required: false, blank: true }), // e.g., "stat_increase", "new_ability", etc.
      details: new fields.ObjectField({ required: false, initial: {} }) // For specific data like stat name, ability UUID, etc.
    });

    const advancementLevelSchema = new fields.SchemaField({
      level: new fields.NumberField({ required: true, integer: true, min: 1 }),
      options: new fields.ArrayField(advancementOptionSchema, { required: false, initial: [] })
    });

    schema.advancementChoices = new fields.ArrayField(advancementLevelSchema, {
      required: false, initial: [], label: 'DIE_RPG.Item.Class.FIELDS.advancementChoices.label'
    });


    return schema;
  }
}