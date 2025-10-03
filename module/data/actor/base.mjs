import { requiredInteger, setOptions } from "../helpers.mjs";

/**
 * A base actor model that provides common properties for both characters and npcs.
 */
export default class DieRpgActorBase extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["DIE_RPG.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    // Iterate over stat names and create a new SchemaField for each.
    schema.stats = new fields.SchemaField(Object.keys(CONFIG.DIE_RPG.stats).reduce((obj, stat) => {
      obj[stat] = new fields.SchemaField({
        value: requiredInteger({initial: 2, max: 4}),
      });
      return obj;
    }, {}));

    // need to make this attribute bar visible with value and max
    schema.resources = new fields.SchemaField(Object.keys(CONFIG.DIE_RPG.resources).reduce((obj, resource) => {
      obj[resource] = new fields.SchemaField({
        value: requiredInteger(),
        max: requiredInteger(),
        temporary: requiredInteger(),
      });
      return obj;
    }, {}));
    
    schema.notes = new fields.HTMLField();

    return schema;
  }

  /** @inheritdoc */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    const updates = {};

    updates.resources = {
      guard: {value: this.stats["dex"].value,},
      health: {value: this.stats["con"].value,},
      willpower: {value: this.stats["wis"].value + this.stats["int"].value,},
    };

    if (!foundry.utils.isEmpty(updates)) this.updateSource(updates);
  }

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    this.resources.guard.max = this.stats["dex"].value;
    this.resources.health.max = this.stats["con"].value;
    this.resources.willpower.max = this.stats["wis"].value + this.stats["int"].value;

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
