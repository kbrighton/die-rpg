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
    cost: new NumberField({
      required: true,
      integer: true,
      initial: 1,
      min: 1,
      max: 4,
      label: 'DIE_RPG.Shared.special.cost.label',
      hint: 'DIE_RPG.Shared.special.cost.hint'
    }),
    mandatory: new BooleanField({
      required: true,
      initial: false,
      label: 'DIE_RPG.Shared.special.mandatory.label',
      hint: 'DIE_RPG.Shared.special.mandatory.hint'
    }),
    key: new StringField({
      required: false,
      blank: true,
      initial: '',
      label: 'DIE_RPG.Shared.special.key.label',
      hint: 'DIE_RPG.Shared.special.key.hint'
    })
  }),
  {
    initial: [],
    label
  }
);
