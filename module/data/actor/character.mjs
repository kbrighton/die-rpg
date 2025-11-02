import { requiredInteger, setOptions, specialsArrayField } from "../helpers.mjs";
import DieRpgActorBase from './base.mjs';

/**
 * Returns the default set of 5 monstrous abilities from the DIE RPG rulebook.
 * Characters can edit, delete, or add to these as needed.
 * @returns {Array} Array of 5 default monstrous ability objects
 */
function getDefaultMonstrousAbilities() {
  // Safely access game.i18n, with fallback if not yet initialized
  const localize = (key, fallback) => {
    return game?.i18n?.localize?.(key) ?? fallback;
  };

  return [
    {
      name: localize('DIE_RPG.MonstrousAbilities.Flight.name', 'Flight'),
      description: localize('DIE_RPG.MonstrousAbilities.Flight.description', '<p>You are able to soar through the sky at a sprinting pace.</p>'),
      customization: localize('DIE_RPG.MonstrousAbilities.Flight.customizationPrompt', '<p><em>Decide what this looks like:</em></p><ul><li>Wings</li><li>Thrusters</li><li>Enormous blood-coated springs</li><li>Something else</li></ul>'),
      specials: []
    },
    {
      name: localize('DIE_RPG.MonstrousAbilities.Intangibility.name', 'Intangibility'),
      description: localize('DIE_RPG.MonstrousAbilities.Intangibility.description', '<p>You are able to move spectrally through objects that bar your path. (This gives you no specific bonus to resist damage.)</p>'),
      customization: localize('DIE_RPG.MonstrousAbilities.Intangibility.customizationPrompt', '<p><em>Decide what this looks like:</em></p><ul><li>Classic spectral</li><li>A burst of digital noise</li><li>Transformation into burrowing worms</li><li>Something else</li></ul>'),
      specials: []
    },
    {
      name: localize('DIE_RPG.MonstrousAbilities.UncannyScenes.name', 'Uncanny Senses'),
      description: localize('DIE_RPG.MonstrousAbilities.UncannyScenes.description', '<p>You can perceive things far beyond normal human capabilities.</p>'),
      customization: localize('DIE_RPG.MonstrousAbilities.UncannyScenes.customizationPrompt', '<p><em>Decide which type of thing you can sense:</em></p><ul><li>Strong emotions</li><li>Heartbeats and breathing</li><li>Narrative</li><li>Something else</li></ul>'),
      specials: []
    },
    {
      name: localize('DIE_RPG.MonstrousAbilities.SizeChanging.name', 'Size Changing'),
      description: localize('DIE_RPG.MonstrousAbilities.SizeChanging.description', '<p>You can swell to four times your height or shrink to a tenth of your size.</p>'),
      customization: localize('DIE_RPG.MonstrousAbilities.SizeChanging.customizationPrompt', '<p><em>Decide what this looks and/or sounds like:</em></p><ul><li>Cracking gristle and bone</li><li>Folding and unfolding fractal limbs</li><li>An incongruous slide-whistle</li><li>Something else</li></ul>'),
      specials: []
    },
    {
      name: localize('DIE_RPG.MonstrousAbilities.ShapeChanging.name', 'Shape Changing'),
      description: localize('DIE_RPG.MonstrousAbilities.ShapeChanging.description', '<p>You can change your form to appear to be something else... until you attack.</p>'),
      customization: localize('DIE_RPG.MonstrousAbilities.ShapeChanging.customizationPrompt', '<p><em>Decide what your tell is, no matter your form:</em></p><ul><li>Your voice remains an awful undead crackle</li><li>You smell like the rotting flesh you are</li><li>All animals view you with fear and suspicion</li><li>Something else</li></ul>'),
      specials: []
    }
  ];
}

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

    schema.fallenMode = new fields.BooleanField({
      required: true,
      initial: false,
      label: 'DIE_RPG.Actor.Character.FIELDS.fallenMode.label',
      hint: 'DIE_RPG.Actor.Character.FIELDS.fallenMode.hint'
    });

    schema.monstrousAbilities = new fields.ArrayField(
      new fields.SchemaField({
        name: new fields.StringField({
          required: true,
          blank: false,
          label: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbility.name.label'
        }),
        description: new fields.HTMLField({
          required: true,
          blank: true,
          label: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbility.description.label',
          hint: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbility.description.hint'
        }),
        customization: new fields.HTMLField({
          required: true,
          blank: true,
          label: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbility.customization.label',
          hint: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbility.customization.hint'
        }),
        specials: specialsArrayField({
          label: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbility.specials.label'
        })
      }),
      {
        label: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbilities.label',
        hint: 'DIE_RPG.Actor.Character.FIELDS.monstrousAbilities.hint',
        initial: getDefaultMonstrousAbilities
      }
    );

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

  /**
   * @override
   * Prepare derived data after initialization.
   * Auto-populate monstrousAbilities if character is fallen but has no abilities.
   */
  prepareDerivedData() {
    super.prepareDerivedData?.();

    // If character is in fallen mode but has no monstrous abilities, populate with defaults
    if (this.fallenMode && (!this.monstrousAbilities || this.monstrousAbilities.length === 0)) {
      this.monstrousAbilities = getDefaultMonstrousAbilities();
    }
  }
}
