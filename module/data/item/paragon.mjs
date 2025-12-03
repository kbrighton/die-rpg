import DieRpgItemBase from './base.mjs';
import { specialsArrayField } from '../helpers.mjs';

/**
 * Data model for Paragon items.
 * Defines the advancement pool and map assignments for a specific paragon class.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgParagon extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'DIE_RPG.Item.Paragon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // ========================================
    // CORE PARAGON FIELDS
    // ========================================

    // Core Nature - Rich text description of the paragon's nature/theme
    schema.coreNature = new fields.HTMLField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Paragon.FIELDS.coreNature.label',
      hint: 'DIE_RPG.Item.Paragon.FIELDS.coreNature.hint'
    });

    // Die Type - The type of class die this paragon uses
    schema.die = new fields.StringField({
      required: true,
      blank: false,
      initial: 'd6',
      choices: ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'],
      label: 'DIE_RPG.Item.Paragon.FIELDS.die.label',
      hint: 'DIE_RPG.Item.Paragon.FIELDS.die.hint'
    });

    // Important Stat - The stat most important to this paragon
    schema.importantStat = new fields.StringField({
      required: true,
      blank: false,
      initial: 'str',
      choices: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
      label: 'DIE_RPG.Item.Paragon.FIELDS.importantStat.label',
      hint: 'DIE_RPG.Item.Paragon.FIELDS.importantStat.hint'
    });

    // Core Ability - The paragon's signature ability
    schema.coreAbility = new fields.SchemaField({
      name: new fields.StringField({
        required: true,
        blank: true,
        initial: '',
        label: 'DIE_RPG.Item.Paragon.FIELDS.coreAbility.name.label'
      }),
      description: new fields.HTMLField({
        required: true,
        blank: true,
        initial: '',
        label: 'DIE_RPG.Item.Paragon.FIELDS.coreAbility.description.label'
      })
    }, {
      label: 'DIE_RPG.Item.Paragon.FIELDS.coreAbility.label'
    });

    // Looks - Array of appearance/clothing options characters can choose from
    schema.looks = new fields.ArrayField(
      new fields.SchemaField({
        name: new fields.StringField({
          required: true,
          blank: true,
          initial: '',
          label: 'DIE_RPG.Item.Paragon.FIELDS.look.name.label'
        }),
        description: new fields.StringField({
          required: false,
          blank: true,
          initial: '',
          label: 'DIE_RPG.Item.Paragon.FIELDS.look.description.label'
        }),
        defenseBonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          label: 'DIE_RPG.Item.Paragon.FIELDS.look.defenseBonus.label'
        })
      }),
      {
        initial: [],
        label: 'DIE_RPG.Item.Paragon.FIELDS.looks.label'
      }
    );

    // Specials - Special abilities that can be activated with 6+ rolls
    schema.specials = specialsArrayField();

    // Equipment Options - Starting equipment characters can select from
    schema.equipmentOptions = new fields.ArrayField(
      new fields.DocumentUUIDField({
        type: "Item",
        nullable: false
      }),
      {
        required: true,
        initial: [],
        label: 'DIE_RPG.Item.Paragon.FIELDS.equipmentOptions.label',
        hint: 'DIE_RPG.Item.Paragon.FIELDS.equipmentOptions.hint'
      }
    );

    // ========================================
    // ADVANCEMENT SYSTEM (EXISTING)
    // ========================================

    // --- Advancement Map Assignment ---
    // Maps each of the 19 node positions to an advancement ID (row0-1 is START, not assigned)
    // Example: { "row1-1": 2, "row1-2": 1, "row1-3": 3, ... }
    // Advancement #1 can appear in multiple positions
    schema.advancementAssignments = new fields.ObjectField({
      required: true,
      initial: {
        "row1-1": 1, "row1-2": 1, "row1-3": 1, "row1-4": 1, "row1-5": 1,
        "row2-1": 1, "row2-2": 1, "row3-1": 1, "row3-2": 1, "row3-3": 1,
        "row4-1": 1, "row4-2": 1, "row4-3": 1, "row4-4": 1, "row4-5": 1,
        "row5-1": 1, "row5-2": 1, "row5-3": 1, "row5-4": 1
      },
      label: 'DIE_RPG.Item.Paragon.FIELDS.advancementAssignments.label'
    });

    // --- Advancement Pool ---
    // The actual advancements available for this paragon
    // Can be 5-20 unique advancements depending on the paragon
    // Each advancement only needs an id and name
    const advancementSchema = new fields.SchemaField({
      id: new fields.NumberField({
        required: true,
        integer: true,
        min: 1,
        label: 'DIE_RPG.Item.Paragon.FIELDS.advancement.id.label'
      }),
      name: new fields.StringField({
        required: true,
        blank: false,
        label: 'DIE_RPG.Item.Paragon.FIELDS.advancement.name.label'
      })
    });

    schema.advancements = new fields.ArrayField(advancementSchema, {
      required: true,
      initial: [
        { id: 1, name: "Sample Advancement" }
      ],
      label: 'DIE_RPG.Item.Paragon.FIELDS.advancements.label'
    });

    // ========================================
    // TEMPLATE-DRIVEN FORM DEFINITIONS
    // ========================================

    // Defines the fields that should appear on the character sheet's "Class" tab
    // when this paragon is selected. Stored as an array of field definition objects.
    schema.classAbilities = new fields.SchemaField({
      fields: new fields.ArrayField(
        new fields.SchemaField({
          key: new fields.StringField({
            required: true,
            blank: false,
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.key.label',
            hint: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.key.hint'
          }),
          type: new fields.StringField({
            required: true,
            blank: false,
            choices: ['text', 'number', 'boolean', 'select', 'multiSelect', 'html', 'info', 'itemList', 'group', 'special'],
            initial: 'text',
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.type.label'
          }),
          label: new fields.StringField({
            required: true,
            blank: false,
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.label.label',
            hint: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.label.hint'
          }),
          description: new fields.StringField({
            required: false,
            blank: true,
            initial: '',
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.description.label',
            hint: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.description.hint'
          }),
          hint: new fields.StringField({
            required: false,
            blank: true,
            initial: '',
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.hint.label'
          }),
          initial: new fields.JSONField({
            required: false,
            nullable: true,
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.initial.label'
          }),
          // Type-specific options
          choices: new fields.ArrayField(
            new fields.StringField(),
            {
              required: false,
              label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.choices.label',
              hint: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.choices.hint'
            }
          ),
          min: new fields.NumberField({
            required: false,
            nullable: true,
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.min.label'
          }),
          max: new fields.NumberField({
            required: false,
            nullable: true,
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.max.label'
          }),
          itemType: new fields.StringField({
            required: false,
            blank: true,
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.itemType.label',
            hint: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.itemType.hint'
          }),
          specialKey: new fields.StringField({
            required: false,
            blank: true,
            label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.specialKey.label',
            hint: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.specialKey.hint'
          }),
          fields: new fields.ArrayField(
            new fields.JSONField(),
            {
              required: false,
              label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.fields.label',
              hint: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.field.fields.hint'
            }
          )
        }),
        {
          label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.fields.label',
          initial: []
        }
      )
    }, {
      label: 'DIE_RPG.Item.Paragon.FIELDS.classAbilities.label'
    });

    // Defines the fields for class-specific advancement forms
    // Displayed on the character sheet's "Advancements" tab below the advancement map
    schema.advancementForms = new fields.SchemaField({
      fields: new fields.ArrayField(
        new fields.SchemaField({
          // Same structure as classAbilities.fields
          key: new fields.StringField({ required: true, blank: false }),
          type: new fields.StringField({
            required: true,
            blank: false,
            choices: ['text', 'number', 'boolean', 'select', 'multiSelect', 'html', 'info', 'itemList', 'group', 'special'],
            initial: 'text'
          }),
          label: new fields.StringField({ required: true, blank: false }),
          description: new fields.StringField({ required: false, blank: true, initial: '' }),
          hint: new fields.StringField({ required: false, blank: true, initial: '' }),
          initial: new fields.JSONField({ required: false, nullable: true }),
          choices: new fields.ArrayField(new fields.StringField(), { required: false }),
          min: new fields.NumberField({ required: false, nullable: true }),
          max: new fields.NumberField({ required: false, nullable: true }),
          itemType: new fields.StringField({ required: false, blank: true }),
          specialKey: new fields.StringField({ required: false, blank: true }),
          fields: new fields.ArrayField(new fields.JSONField(), { required: false })
        }),
        {
          label: 'DIE_RPG.Item.Paragon.FIELDS.advancementForms.fields.label',
          initial: []
        }
      )
    }, {
      label: 'DIE_RPG.Item.Paragon.FIELDS.advancementForms.label'
    });

    // Optional: Images for theming
    schema.classDiceImage = new fields.FilePathField({
      required: false,
      categories: ['IMAGE'],
      label: 'DIE_RPG.Item.Paragon.FIELDS.classDiceImage.label',
      hint: 'DIE_RPG.Item.Paragon.FIELDS.classDiceImage.hint'
    });

    schema.portraitImage = new fields.FilePathField({
      required: false,
      categories: ['IMAGE'],
      label: 'DIE_RPG.Item.Paragon.FIELDS.portraitImage.label',
      hint: 'DIE_RPG.Item.Paragon.FIELDS.portraitImage.hint'
    });

    schema.tokenImage = new fields.FilePathField({
      required: false,
      categories: ['IMAGE'],
      label: 'DIE_RPG.Item.Paragon.FIELDS.tokenImage.label',
      hint: 'DIE_RPG.Item.Paragon.FIELDS.tokenImage.hint'
    });

    return schema;
  }
}
