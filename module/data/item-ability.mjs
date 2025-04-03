import DieRpgItemBase from './base-item.mjs';

/**
 * Data model for Ability items (repurposed from Spell).
 * Represents class abilities, powers, etc.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgAbility extends DieRpgItemBase { // Renamed class
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Ability', // Updated prefix
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema(); // Inherits description

    // Removed spellLevel field

    // --- Placeholder fields for Ability properties ---
    // These will need refinement based on specific ability needs

    schema.cost = new fields.StringField({ // e.g., "1 Willpower", "1 Class Die"
      required: false,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Ability.FIELDS.cost.label' // Assuming localization key
    });

    schema.range = new fields.StringField({ // e.g., "Self", "Touch", "60 feet"
      required: false,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Ability.FIELDS.range.label' // Assuming localization key
    });

    schema.duration = new fields.StringField({ // e.g., "Instantaneous", "1 round", "Concentration"
      required: false,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Ability.FIELDS.duration.label' // Assuming localization key
    });

    schema.effectDescription = new fields.HTMLField({ // Detailed effect text beyond base description
      required: false,
      blank: true,
      label: 'DIE_RPG.Item.Ability.FIELDS.effectDescription.label' // Assuming localization key
    });

    schema.specialText = new fields.StringField({ // Text for the Special triggered on a 6+
      required: false,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Ability.FIELDS.specialText.label' // Assuming localization key
    });

    // TODO: Add fields for roll modifications (e.g., grant advantage, add dice)?
    // TODO: Add fields for linking to Active Effects?

    return schema;
  }
}
