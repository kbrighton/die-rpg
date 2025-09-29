export default class DieRpgActorBase extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["DIE_RPG.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // Iterate over stat names and create a new SchemaField for each.
    schema.stats = new fields.SchemaField(Object.keys(CONFIG.DIE_RPG.stats).reduce((obj, stat) => {
      obj[stat] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0, max: 4 }),
      });
      return obj;
    }, {}));

    // need to make this attribute bar visible with value and max
    schema.resources = new fields.SchemaField(Object.keys(CONFIG.DIE_RPG.resources).reduce((obj, resource) => {
      obj[resource] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        modifiedValue: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        modifiedMax: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));
    
    schema.notes = new fields.HTMLField();

    return schema;
  }

  prepareDerivedData() {
    for (const key in this.stats) {
      // Handle stats label & abbreviation localization.
      this.stats[key].label = game.i18n.localize(CONFIG.DIE_RPG.stats[key]) ?? key;
      this.stats[key].abbr = game.i18n.localize(CONFIG.DIE_RPG.statAbbreviations[key]) ?? key;
    }

    for (const key in this.resources) {
      // Handle resources label localization.
      this.resources[key].label = game.i18n.localize(CONFIG.DIE_RPG.resources[key]) ?? key;
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
