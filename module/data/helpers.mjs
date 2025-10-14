const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Constructs a number field that is always a number with a min of 0.
 * @param {object} [options] Options to forward to the field.
 * @param {number} [options.initial=0]  The initial value for the field.
 * @param {number} [options.min=0]      The minimum value for the field.
 * @param {number} [options.max]        The maximum value for the field.
 * @param {string} [options.label]      Label for the field.
 * @returns A number field that is non-nullable and always defined.
 */
export const requiredInteger = ({ initial = 0, min = 0, max, label } = {}) => new NumberField({ initial, label, min, max, required: true, nullable: false, integer: true });

/* -------------------------------------------------- */

/**
 * Constructs a string field for use inside of a SetField.
 * @param {object} [options] Options to forward to the field.
 * @param {Record<string, string>} [options.choices] CONST-derived choices for the field.
 * @param {Function} [options.validate] A validator function for field values.
 * @returns A string field that is always truthy.
 */
export const setOptions = ({ choices, validate } = {}) => new StringField({ required: true, blank: false, choices, validate });

/* -------------------------------------------------- */

/**
 * Constructs an array field for specials (special abilities activated with 6+ rolls).
 * Used by Paragon items, Ability items, Equipment items, and potentially character sheets.
 * @param {object} [options] Options to forward to the ArrayField.
 * @param {string} [options.label] Label for the array field (defaults to shared label).
 * @returns An ArrayField containing the specials schema.
 */
export const specialsArrayField = ({ label = 'DIE_RPG.Item.Paragon.FIELDS.specials.label' } = {}) => new ArrayField(
  new SchemaField({
    name: new StringField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Shared.special.name.label'
    }),
    description: new HTMLField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Shared.special.description.label'
    }),
    cost: new StringField({
      required: true,
      blank: false,
      initial: 'special',
      choices: ['special', 'double', 'triple', 'quad', 'twenty'],
      label: 'DIE_RPG.Shared.special.cost.label',
      hint: 'DIE_RPG.Shared.special.cost.hint'
    }),
    mandatory: new BooleanField({
      required: true,
      initial: false,
      label: 'DIE_RPG.Shared.special.mandatory.label',
      hint: 'DIE_RPG.Shared.special.mandatory.hint'
    })
  }),
  {
    initial: [],
    label
  }
);

/* -------------------------------------------------- */

/**
 * Constructs an array field for scriptures (God/Godbinder benefits with specials).
 * Used by God items - typically 3 scriptures but configurable.
 * @param {object} [options] Options to forward to the ArrayField.
 * @param {string} [options.label] Label for the array field.
 * @param {number} [options.initialCount] Number of initial scriptures (default 3).
 * @returns An ArrayField containing the scriptures schema.
 */
export const scripturesArrayField = ({ label = 'DIE_RPG.Item.God.FIELDS.scriptures.label', initialCount = 3 } = {}) => new ArrayField(
  new SchemaField({
    name: new StringField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.God.FIELDS.scripture.name.label'
    }),
    description: new HTMLField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.God.FIELDS.scripture.description.label'
    }),
    specials: specialsArrayField({ label: 'DIE_RPG.Item.God.FIELDS.scripture.specials.label' })
  }),
  {
    initial: Array.from({ length: initialCount }, () => ({
      name: '',
      description: '',
      specials: []
    })),
    label
  }
);

/* -------------------------------------------------- */

/**
 * Constructs an array field for upgrades (Gifts of the Fair/Neo upgrades).
 * Used by Gift items - upgrades can be picked multiple times.
 * @param {object} [options] Options to forward to the ArrayField.
 * @param {string} [options.label] Label for the array field.
 * @returns An ArrayField containing the upgrades schema.
 */
export const upgradesArrayField = ({ label = 'DIE_RPG.Item.Gift.FIELDS.upgrades.label' } = {}) => new ArrayField(
  new SchemaField({
    name: new StringField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Gift.FIELDS.upgrade.name.label'
    }),
    description: new HTMLField({
      required: true,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Item.Gift.FIELDS.upgrade.description.label'
    }),
    defenseBonus: new NumberField({
      required: true,
      integer: true,
      initial: 0,
      min: 0,
      label: 'DIE_RPG.Item.Gift.FIELDS.upgrade.defenseBonus.label'
    }),
    specials: specialsArrayField({ label: 'DIE_RPG.Item.Gift.FIELDS.upgrade.specials.label' })
  }),
  {
    initial: [],
    label
  }
);
