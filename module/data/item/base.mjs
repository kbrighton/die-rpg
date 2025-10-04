/**
 * A base item model that provides common properties for all items.
 */
export default class DieRpgItemBase extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ['DIE_RPG.Item.base'];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({
      required: true,
      blank: true,
    });

    return schema;
  }
}
