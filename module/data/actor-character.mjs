import DieRpgActorBase from './base-actor.mjs';

export default class DieRpgCharacter extends DieRpgActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'DIE_RPG.Actor.Character',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.level = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
    });
    schema.look = new fields.StringField({ required: true, blank: true });

    schema.paragon = new fields.SchemaField({
      type: new fields.StringField({ required: true, blank: true }),
      paragonType: new fields.StringField({ required: true, blank: true }),
    });

    schema.persona = new fields.SchemaField({
      name: new fields.StringField({ required: true, blank: true }),
      pronouns: new fields.StringField({ required: true, blank: true }),
      // img: new FilePathField({ required: false, categories: ["IMAGE"] }),
      biography: new fields.HTMLField({required: false, initial: undefined}),
    });

    return schema;
  }

  // prepareDerivedData() {
  //   // 
  // }

  getRollData() {
    const data = super.getRollData();

    data.lvl = this.attributes.level;

    return data
  }
}
