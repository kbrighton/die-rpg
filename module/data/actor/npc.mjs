import DieRpgActorBase from './base.mjs';
import { specialsArrayField } from '../helpers.mjs';

export default class DieRpgNPC extends DieRpgActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'DIE_RPG.Actor.NPC',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    // const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Structured abilities array with name, description, and nested specials
    schema.abilities = new fields.ArrayField(
      new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: false }),
        description: new fields.HTMLField({ required: true, blank: true }),
        specials: specialsArrayField({ label: 'DIE_RPG.Actor.NPC.FIELDS.ability.specials.label' }),
      })
    );

    // Top-level specials that are always available (not tied to a specific ability)
    schema.specials = specialsArrayField({ label: 'DIE_RPG.Actor.NPC.FIELDS.specials.label' });

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
    schema.description = new fields.HTMLField({ required: false, blank: true }); // General NPC description and flavor text

    return schema;
  }
}
