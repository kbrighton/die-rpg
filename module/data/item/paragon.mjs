import DieRpgItemBase from './base.mjs';

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

    // --- Advancement Map Assignment ---
    // Maps each of the 20 node positions to an advancement ID
    // Example: { "row0-1": 1, "row1-1": 2, "row1-2": 1, "row1-3": 3, ... }
    // Advancement #1 can appear in multiple positions
    schema.advancementAssignments = new fields.ObjectField({
      required: true,
      initial: {
        "row0-1": 1, "row1-1": 1, "row1-2": 1, "row1-3": 1, "row1-4": 1, "row1-5": 1,
        "row2-1": 1, "row2-2": 1, "row3-1": 1, "row3-2": 1, "row3-3": 1,
        "row4-1": 1, "row4-2": 1, "row4-3": 1, "row4-4": 1, "row4-5": 1,
        "row5-1": 1, "row5-2": 1, "row5-3": 1, "row5-4": 1
      },
      label: 'DIE_RPG.Item.Paragon.FIELDS.advancementAssignments.label'
    });

    // --- Advancement Pool ---
    // The actual advancements available for this paragon
    // Can be 5-20 unique advancements depending on the paragon
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
      }),
      description: new fields.HTMLField({
        required: false,
        blank: true,
        label: 'DIE_RPG.Item.Paragon.FIELDS.advancement.description.label'
      }),
      icon: new fields.StringField({
        required: false,
        blank: true,
        initial: '',
        label: 'DIE_RPG.Item.Paragon.FIELDS.advancement.icon.label'
      })
    });

    schema.advancements = new fields.ArrayField(advancementSchema, {
      required: true,
      initial: [
        { id: 1, name: "Sample Advancement", description: "<p>This is a placeholder advancement.</p>", icon: "" }
      ],
      label: 'DIE_RPG.Item.Paragon.FIELDS.advancements.label'
    });

    return schema;
  }
}
