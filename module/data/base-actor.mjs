export default class DieRpgActorBase extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["DIE_RPG.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.resources = new fields.SchemaField({
      health: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }), // Derived: Equal to Dexterity
      }),
      guard: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }), // Derived: Equal to Constitution
      }),
      willpower: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }), //starts equal to a character’s Wisdom plus their Intelligence
      }),
      defense: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }), // Derived: from items
      }),
    });
    
    schema.notes = new fields.HTMLField();

    // Iterate over stat names and create a new SchemaField for each.
    schema.stats = new fields.SchemaField(Object.keys(CONFIG.DIE_RPG.stats).reduce((obj, stat) => {
      obj[stat] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0, max: 4 }),
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
    // this.resources.guard.max = this.stats["dex"].value;
    // this.resources.health.max = this.stats["con"].value;
    // TODO: these need to be set only on character creation
    // this.resources.guard.value = this.stats["dex"].value;
    // this.resources.health.value = this.stats["con"].value;
    // this.resources.willpower.value = this.stats["wis"].value + this.stats["int"].value;

    // Loop through stats scores, and add their modifiers to our sheet output.
    for (const key in this.stats) {
      // Handle stats label localization.
      this.stats[key].label = game.i18n.localize(CONFIG.DIE_RPG.stats[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the stat scores to the top level, so that rolls can use
    // formulas like `@str.value + 4`.
    if (this.stats) {
      for (let [k,v] of Object.entries(this.stats)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    return data
  }
}
