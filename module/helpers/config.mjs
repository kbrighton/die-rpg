export const DIE_RPG = {};

/**
 * The set of stat Scores used within the system.
 * @type {Object}
 */

DIE_RPG.stats = {
  str: 'DIE_RPG.Stat.Str.long',
  dex: 'DIE_RPG.Stat.Dex.long',
  con: 'DIE_RPG.Stat.Con.long',
  int: 'DIE_RPG.Stat.Int.long',
  wis: 'DIE_RPG.Stat.Wis.long',
  cha: 'DIE_RPG.Stat.Cha.long',
};

DIE_RPG.statAbbreviations = {
  str: 'DIE_RPG.Stat.Str.abbr',
  dex: 'DIE_RPG.Stat.Dex.abbr',
  con: 'DIE_RPG.Stat.Con.abbr',
  int: 'DIE_RPG.Stat.Int.abbr',
  wis: 'DIE_RPG.Stat.Wis.abbr',
  cha: 'DIE_RPG.Stat.Cha.abbr',
};

DIE_RPG.resources = {
  guard: 'DIE_RPG.Resources.gua.long',
  health: 'DIE_RPG.Resources.hea.long',
  willpower: 'DIE_RPG.Resources.wil.long',
  defense: 'DIE_RPG.Resources.def.long',
};

DIE_RPG.resourcesAbbreviations = {
  guard: 'DIE_RPG.Resources.gua.abbr',
  health: 'DIE_RPG.Resources.hea.abbr',
  willpower: 'DIE_RPG.Resources.wil.abbr',
  defense: 'DIE_RPG.Resources.def.abbr',
};

DIE_RPG.npcTypes = {
  basic: 'DIE_RPG.NPCSheet.Type.Basic.label',
  fallen: 'DIE_RPG.NPCSheet.Type.Fallen.label',
  paragon: 'DIE_RPG.NPCSheet.Type.Paragon.label',
};

DIE_RPG.npcFallenSubtypes = {
  basic: 'DIE_RPG.NPCSheet.Type.Fallen.Subtype.Basic',
  elite: 'DIE_RPG.NPCSheet.Type.Fallen.Subtype.Elite',
  assassin: 'DIE_RPG.NPCSheet.Type.Fallen.Subtype.Essassin',
  epic: 'DIE_RPG.NPCSheet.Type.Fallen.Subtype.Epic',
};

DIE_RPG.npcParagonPowerLevel = {
  basic: 'DIE_RPG.NPCSheet.Type.Paragon.PowerLevel.Basic',
  elite: 'DIE_RPG.NPCSheet.Type.Paragon.PowerLevel.Elite',
  hero: 'DIE_RPG.NPCSheet.Type.Paragon.PowerLevel.Hero',
};

DIE_RPG.classDice = {
  "d4": "d4",
  "d6": "d6",
  "d8": "d8",
  "d10": "d10",
  "d12": "d12",
  "d20": "d20"
}; // Close classDice object

DIE_RPG.classBaseTypes = {
  "Dictator": "DIE_RPG.Class.Dictator", // Assuming localization keys like this
  "Fool": "DIE_RPG.Class.Fool",
  "Emotion Knight": "DIE_RPG.Class.EmotionKnight",
  "Godbinder": "DIE_RPG.Class.Godbinder",
  "Neo": "DIE_RPG.Class.Neo",
  "Master": "DIE_RPG.Class.Master"
};