import DieRpgItemBase from './base-item.mjs';

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
      // More specific choices based on rules
      choices: ['general', 'scripture', 'gift', 'stance', 'venting', 'special', 'attack', 'passive'],
      label: 'DIE_RPG.Item.Ability.FIELDS.abilityType.label'
    });

    schema.activation = new fields.SchemaField({
      type: new fields.StringField({ // e.g., "Action", "Reaction", "Free", "Passive"
        required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.activation.type.label'
      }),
      cost: new fields.StringField({ // e.g., "1 Willpower", "1 Class Die", "1 Fair Gold"
        required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.activation.cost.label'
      })
    });

    schema.range = new fields.StringField({ // e.g., "Self", "Touch", "Close", "Medium", "Far"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.range.label'
    });

    schema.duration = new fields.StringField({ // e.g., "Instantaneous", "1 round", "Concentration", "Special"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.duration.label'
    });

    schema.target = new fields.StringField({ // e.g., "Self", "1 creature", "All enemies in Close range"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.target.label'
    });

    // --- Roll Details (Optional) ---
    schema.roll = new fields.SchemaField({
      stat: new fields.StringField({ // Which stat to use (str, dex, cha, etc.)
        required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.roll.stat.label'
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

    // --- Effect & Special ---
    schema.effectDescription = new fields.HTMLField({ // Detailed effect text
      required: false, blank: true, label: 'DIE_RPG.Item.Ability.FIELDS.effectDescription.label'
    });

    schema.special = new fields.SchemaField({
       trigger: new fields.StringField({ // e.g., "6+", "Double 6+", "20-Special"
         required: false, blank: true, initial: '6+', label: 'DIE_RPG.Item.Ability.FIELDS.special.trigger.label'
       }),
       text: new fields.StringField({ // The special effect text
         required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.special.text.label'
       }),
       is_mandatory: new fields.BooleanField({
         required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.special.is_mandatory.label'
       })
    }, { required: false, nullable: true, initial: null }); // Make special object optional

    // --- Attack Flags ---
    schema.isAttack = new fields.BooleanField({
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isAttack.label'
    });
    schema.isSpellAttack = new fields.BooleanField({ // For abilities that check casting success AND attack
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isSpellAttack.label'
    });

    // --- New/Modified Fields ---
    schema.grantedBy = new fields.StringField({ // e.g., Class name, Item name
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.grantedBy.label'
    });

    schema.requirements = new fields.StringField({ // e.g., "Emotion Scale >= 1"
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.requirements.label'
    });

    schema.scriptureGod = new fields.StringField({ // For Scriptures, which god grants it
      required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.scriptureGod.label'
    });

    // Structure for Neo Gift Upgrades
    const upgradeSchema = new fields.SchemaField({
        name: new fields.StringField({required: true, blank: false}),
        description: new fields.HTMLField({required: false, blank: true}),
        isDefensive: new fields.BooleanField({required: false, initial: false})
    });
    schema.giftUpgrades = new fields.ArrayField(upgradeSchema, {
        required: false, initial: [], label: 'DIE_RPG.Item.Ability.FIELDS.giftUpgrades.label'
    });

    schema.isDefensiveUpgrade = new fields.BooleanField({ // Flag for Neo Gift upgrades themselves
      required: false, initial: false, label: 'DIE_RPG.Item.Ability.FIELDS.isDefensiveUpgrade.label'
    });

    // --- Linked Effect ---
    // schema.linkedEffect = new fields.StringField({ // UUID of an Active Effect document
    //   required: false, blank: true, initial: '', label: 'DIE_RPG.Item.Ability.FIELDS.linkedEffect.label'
    // });

    return schema;
  }
}
