import DieRpgItemBase from './base.mjs';
import { specialsArrayField } from '../helpers.mjs';

/**
 * Data model for Ability items (repurposed from Spell).
 * Represents class abilities, powers, specials, scriptures, gifts, etc.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgAbility extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Ability',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema(); // Inherits description

    // --- Ability Core Fields ---
    schema.abilityType = new fields.StringField({
      required: true,
      blank: false,
      initial: 'general', // Default type
      choices: ['general', 'scripture', 'gift', 'stance', 'venting', 'knack', 'fool_spell', 'dictator_performance', 'signature_piece', 'master_rule', 'cheat', 'attack', 'passive', 'other'], // Expanded choices
      label: 'DIE_RPG.Item.Ability.FIELDS.abilityType.label'
    });

    // Refined Activation Cost Structure
    schema.costType = new fields.StringField({
        required: true, blank: false, initial: 'none',
        choices: ['none', 'action', 'resource', 'condition'],
        label: 'DIE_RPG.Item.Ability.FIELDS.costType.label'
    });
    schema.costAction = new fields.StringField({ // Type of action if costType is 'action'
        required: false, blank: true, initial: 'action',
        choices: ['action', 'reaction', 'free', 'passive', 'special'], // 'special' for unique timings
        label: 'DIE_RPG.Item.Ability.FIELDS.costAction.label'
    });
    schema.costResource = new fields.StringField({ // Type of resource if costType is 'resource'
        required: false, blank: true, initial: 'none',
        choices: ['none', 'fair_gold', 'god_debt', 'ek_scale', 'cheat_token', 'health', 'guard', 'willpower'],
        label: 'DIE_RPG.Item.Ability.FIELDS.costResource.label'
    });
    schema.costAmount = new fields.NumberField({ // Amount of resource/action if applicable
        required: false, integer: true, nullable: true, initial: null, min: 0,
        label: 'DIE_RPG.Item.Ability.FIELDS.costAmount.label'
    });
     schema.costCondition = new fields.StringField({ // Text description if costType is 'condition'
        required: false, blank: true, initial: '',
        label: 'DIE_RPG.Item.Ability.FIELDS.costCondition.label'
    });
    // Removed old activation schema

    schema.range = new fields.StringField({ // e.g., "Self", "Touch", "Close", "Medium", "Far", "Special"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.range.label'
    });

    schema.duration = new fields.StringField({ // e.g., "Instantaneous", "Encounter", "Concentration", "Until Dawn", "Permanent", "Special"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.duration.label'
    });

    schema.target = new fields.StringField({ // e.g., "Self", "1 creature", "Area", "All enemies in Close range"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.target.label'
    });

    // --- Roll Details (Optional) ---
    schema.roll = new fields.SchemaField({
      stat: new fields.StringField({ // Which stat to use (str, dex, cha, etc.)
        required: false, blank: true, initial: '', choices: ['', ...Object.keys(CONFIG.DIE_RPG.stats)], label: 'DIE_RPG.Item.Ability.FIELDS.roll.stat.label'
      }),
      add_class_die: new fields.BooleanField({ // Always add class die for this ability?
        required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.roll.add_class_die.label'
      }),
      fixed_adv: new fields.NumberField({ // Fixed advantages granted by ability
        required: false, integer: true, initial: 0, label: 'DIE_RPG.Item.Ability.FIELDS.roll.fixed_adv.label'
      }),
      fixed_disadv: new fields.NumberField({ // Fixed disadvantages imposed by ability
        required: false, integer: true, initial: 0, label: 'DIE_RPG.Item.Ability.FIELDS.roll.fixed_disadv.label'
      }),
      base_difficulty: new fields.NumberField({ // Base difficulty if ability sets it
        required: false, integer: true, initial: 0, min: 0, max: 2, label: 'DIE_RPG.Item.Ability.FIELDS.roll.base_difficulty.label'
      })
    }, { required: false, nullable: true, initial: null }); // Make the whole roll object optional

    // --- Effect & Specials ---
    schema.effectDescription = new fields.HTMLField({ // Detailed effect text
      required: false, blank: true, label: 'DIE_RPG.Item.Ability.FIELDS.effectDescription.label'
    });

    // Replaced simple 'special' object with structured 'specials' array
    schema.specials = specialsArrayField({ label: 'DIE_RPG.Item.Ability.FIELDS.specials.label' });

    // --- Attack Details (Optional) ---
    schema.isAttack = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isAttack.label'
    });
    schema.isSpellAttack = new fields.BooleanField({ // For abilities that check casting success AND attack
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isSpellAttack.label'
    });
    schema.attackType = new fields.StringField({
        required: false, blank: true, initial: 'none',
        choices: ['none', 'melee', 'ranged', 'spell'],
        label: 'DIE_RPG.Item.Ability.FIELDS.attackType.label'
    });
     schema.damageType = new fields.StringField({
        required: false, blank: true, initial: '',
        label: 'DIE_RPG.Item.Ability.FIELDS.damageType.label'
    });


    // --- Context & Requirements ---
    schema.grantedBy = new fields.StringField({ // e.g., Class name, Item name, Advancement
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.grantedBy.label'
    });

    schema.requirements = new fields.StringField({ // e.g., "Emotion Scale >= 1", "Level 3"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.requirements.label'
    });

    schema.source = new fields.StringField({ // e.g., "DIE Core Rulebook p. 88"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.source.label'
    });

    // --- Class Specific Fields ---

    // Godbinder
    schema.scriptureGod = new fields.StringField({ // For Scriptures, which god grants it
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.scriptureGod.label'
    });
    schema.scriptureLevel = new fields.NumberField({ // Level required in god relationship
      required: false, integer: true, nullable: true, initial: null, min: 1, max: 3, label: 'DIE_RPG.Item.Ability.FIELDS.scriptureLevel.label'
    });
     schema.incursGodDebt = new fields.BooleanField({ // Does rolling a 1 on d12 incur debt?
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.incursGodDebt.label'
    });

    // Neo
    schema.isGift = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isGift.label'
    });
    schema.giftActivationCost = new fields.NumberField({ // Cost in Fair Gold to activate
      required: false, integer: true, nullable: true, initial: null, min: 0, label: 'DIE_RPG.Item.Ability.FIELDS.giftActivationCost.label'
    });
    // Structure for Neo Gift Upgrades (can be represented as separate 'ability' items linked via requirements/grantedBy, or nested here)
    // Let's assume upgrades are separate items for now to avoid deep nesting.
    // schema.giftUpgrades = new fields.ArrayField(...) // Removed for now

    // Emotion Knight
    schema.isStance = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isStance.label'
    });
    schema.isVenting = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isVenting.label'
    });
    schema.ekScaleCost = new fields.NumberField({ // Cost in EK Scale points
      required: false, integer: true, nullable: true, initial: null, min: 0, label: 'DIE_RPG.Item.Ability.FIELDS.ekScaleCost.label'
    });
    schema.ekScaleRequirement = new fields.NumberField({ // Min EK Scale needed
      required: false, integer: true, nullable: true, initial: null, min: 0, label: 'DIE_RPG.Item.Ability.FIELDS.ekScaleRequirement.label'
    });
    schema.ekSacredEmotion = new fields.StringField({ // Associated sacred emotion
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.ekSacredEmotion.label'
    });

    // Fool
    schema.isKnack = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isKnack.label'
    });
    schema.isFoolSpell = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isFoolSpell.label'
    });
    schema.foolCondition = new fields.StringField({ // Condition for adding D6
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.foolCondition.label'
    });

    // Dictator
    schema.isDictatorPerformance = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isDictatorPerformance.label'
    });
    schema.dictatorEmotion = new fields.StringField({ // Associated emotion
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.dictatorEmotion.label'
    });
    schema.isSignaturePiece = new fields.BooleanField({ // Dictator spell
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isSignaturePiece.label'
    });

    // Master
    schema.isMasterRule = new fields.BooleanField({ // Master spell
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isMasterRule.label'
    });
    schema.isCheat = new fields.BooleanField({ // Hardcore Cheat
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isCheat.label'
    });
    schema.cheatCost = new fields.NumberField({ // Cost in Cheat Tokens
      required: false, integer: true, nullable: true, initial: null, min: 0, label: 'DIE_RPG.Item.Ability.FIELDS.cheatCost.label'
    });

    return schema;
  }
}
