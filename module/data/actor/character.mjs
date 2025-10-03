import { requiredInteger, setOptions } from "../helpers.mjs";
import DieRpgActorBase from './base.mjs';

/**
 * Data model for characters controlled by players.
 */
export default class DieRpgCharacter extends DieRpgActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'DIE_RPG.Actor.Character',
  ];

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.level = requiredInteger({ initial: 1, max: 20 });
    schema.look = new fields.StringField({ required: true, blank: true });

    schema.paragon = new fields.SchemaField({
      name: new fields.StringField({ required: true, blank: true }),
      nature: new fields.HTMLField(),
      die: new fields.SetField(setOptions()),
      importantStat: new fields.StringField({ required: true, blank: true }),
      looks: new fields.StringField({ required: true, blank: true }),
      specials: new fields.StringField({ required: true, blank: true }),
      coreAbility: new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: true }),
        description: new fields.HTMLField(),
      })
    });

    schema.persona = new fields.SchemaField({
      name: new fields.StringField({ required: true, blank: true }),
      pronouns: new fields.StringField({ required: true, blank: true }),
      img: new fields.FilePathField({categories: ["IMAGE"]}),
      notes: new fields.HTMLField({required: false, initial: undefined}),
    });

    return schema;
  }
  
  /** @inheritdoc */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    const updates = {
      prototypeToken: {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER
      },
    };

    // TODO: add a template to persona.notes

    this.parent.updateSource(updates);
  }

  getRollData() {
    const data = super.getRollData();

    data.lvl = this.level;

    return data
  }
}
