import DieRpgItemBase from './base.mjs';

/**
 * Data model for Persona items.
 * @extends {DieRpgItemBase}
 */
export default class DieRpgPersona extends DieRpgItemBase {
  static LOCALIZATION_PREFIXES = [
    'DIE_RPG.Item.base',
    'DIE_RPG.Item.Persona', // Assuming this localization path
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema(); // Inherits description

    // Define fields specific to Persona items based on data.yaml notes
    schema.sharedHistory = new fields.HTMLField({
      required: false,
      blank: true,
      label: 'DIE_RPG.Item.Persona.FIELDS.sharedHistory.label' // Assuming localization key
    });

    schema.familiarObsessions = new fields.HTMLField({
      required: false,
      blank: true,
      label: 'DIE_RPG.Item.Persona.FIELDS.familiarObsessions.label' // Assuming localization key
    });

    // 'Creative Personas with a vivid inner imaginary life' - This might be flavor text or imply a boolean flag?
    // schema.isCreative = new fields.BooleanField({ initial: false, label: '...' });

    // 'Notes' field from data.yaml - Base description might cover this, or add a separate notes field if needed.
    // schema.notes = new fields.HTMLField({ required: false, blank: true, label: '...' });

   schema.playerNotes = new fields.HTMLField({
     required: false,
     blank: true,
     label: 'DIE_RPG.Item.Persona.FIELDS.playerNotes.label' // Assuming localization key
   });

   return schema;
  }

  // prepareDerivedData() {
  //   super.prepareDerivedData();
  // }

  // getRollData() {
  //   const data = super.getRollData();
  //   return data;
  // }
}