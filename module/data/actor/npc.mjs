import DieRpgActorBase from './base.mjs';

export default class DieRpgNPC extends DieRpgActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'DIE_RPG.Actor.NPC',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    // const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Structured abilities array with name, description, and Special flags
    schema.abilities = new fields.ArrayField(
      new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: false }),
        description: new fields.HTMLField({ required: true, blank: true }),
        hasSpecial: new fields.BooleanField({ initial: false }),
        hasDoubleSpecial: new fields.BooleanField({ initial: false }),
        hasTripleSpecial: new fields.BooleanField({ initial: false }),
      })
    );

    // NPC type and subtype attributes
    schema.attributes = new fields.SchemaField({
      // Main NPC type: "paragon", "echo", "fallen", "fair", "creature"
      npcType: new fields.StringField({ required: true, blank: true }),

      // Subtype fields (used based on npcType)
      fallenSubtype: new fields.StringField({ required: true, blank: true }), // "basic", "elite", "assassin", "epic"
      paragonSubtype: new fields.StringField({ required: true, blank: true }), // "dictator", "neo", "emotion-knight", etc.
      paragonPowerLevel: new fields.StringField({ required: true, blank: true }), // "basic", "elite", "hero"
      echoLevel: new fields.StringField({ required: true, blank: true }), // "appearance", "feelings", "complete"
      creatureType: new fields.StringField({ required: true, blank: true }), // "dragon", "vampire", "zombie", etc.
    });

    // Additional NPC-specific fields
    schema.description = new fields.HTMLField({ required: false, blank: true }); // Stat block flavor text
    schema.defenceNotes = new fields.HTMLField({ required: false, blank: true }); // For conditional defence (e.g., "Defence 2 vs normal, 1 vs magic")

    return schema;
  }
}
