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

    schema.flashbackUsed = new fields.BooleanField({
      required: true,
      initial: false,
      label: 'DIE_RPG.Actor.Character.FIELDS.flashbackUsed.label',
      hint: 'DIE_RPG.Actor.Character.FIELDS.flashbackUsed.hint'
    });

    schema.paragon = new fields.SchemaField({
      uuid: new fields.StringField({ required: false, blank: true, initial: '' }),
      selectedLook: new fields.StringField({ required: true, blank: true }),
      customLookText: new fields.StringField({ required: true, blank: true }),
      advancements: new fields.SetField(
        new fields.StringField(),
        { initial: ["row0-1"] }
      ),

      // Store user's class ability selections/values
      classAbilityData: new fields.ObjectField({
        required: true,
        initial: {},
        label: 'DIE_RPG.Actor.Character.FIELDS.paragon.classAbilityData.label',
        hint: 'DIE_RPG.Actor.Character.FIELDS.paragon.classAbilityData.hint'
      }),

      // Store user's advancement form selections/values
      advancementData: new fields.ObjectField({
        required: true,
        initial: {},
        label: 'DIE_RPG.Actor.Character.FIELDS.paragon.advancementData.label',
        hint: 'DIE_RPG.Actor.Character.FIELDS.paragon.advancementData.hint'
      })
    });

    schema.persona = new fields.SchemaField({
      name: new fields.StringField({ required: true, blank: true }),
      pronouns: new fields.StringField({ required: true, blank: true }),
      img: new fields.FilePathField({
        categories: ["IMAGE"],
        initial: "icons/svg/mystery-man.svg"
      }),
      notes: new fields.HTMLField({ required: false, blank: true, initial: '' }),
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
