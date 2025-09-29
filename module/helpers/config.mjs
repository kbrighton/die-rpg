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
  guard: 'DIE_RPG.Resource.gua.long',
  health: 'DIE_RPG.Resource.hea.long',
  willpower: 'DIE_RPG.Resource.wil.long',
  defense: 'DIE_RPG.Resource.def.long',
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
  4: "d4",
  6: "d6",
  8: "d8",
  10: "d10",
  12: "d12",
  20: "d20"
};

DIE_RPG.classBaseTypes = {
  dictator: "DIE_RPG.Class.Dictator",
  fool: "DIE_RPG.Class.Fool",
  emotion_knight: "DIE_RPG.Class.EmotionKnight",
  godbinder: "DIE_RPG.Class.Godbinder",
  neo: "DIE_RPG.Class.Neo",
  master: "DIE_RPG.Class.Master"
};


DIE_RPG.abilityTypes = {
  general: "DIE_RPG.AbilityType.general",
  scripture: "DIE_RPG.AbilityType.scripture",
  gift: "DIE_RPG.AbilityType.gift",
  stance: "DIE_RPG.AbilityType.stance",
  venting: "DIE_RPG.AbilityType.venting",
  knack: "DIE_RPG.AbilityType.knack",
  fool_spell: "DIE_RPG.AbilityType.fool_spell",
  dictator_performance: "DIE_RPG.AbilityType.dictator_performance",
  signature_piece: "DIE_RPG.AbilityType.signature_piece",
  master_rule: "DIE_RPG.AbilityType.master_rule",
  cheat: "DIE_RPG.AbilityType.cheat",
  attack: "DIE_RPG.AbilityType.attack",
  passive: "DIE_RPG.AbilityType.passive",
  other: "DIE_RPG.AbilityType.other"
};

DIE_RPG.costTypes = {
  none: "DIE_RPG.CostType.none",
  action: "DIE_RPG.CostType.action",
  resource: "DIE_RPG.CostType.resource",
  condition: "DIE_RPG.CostType.condition"
};

DIE_RPG.actionCosts = {
  action: "DIE_RPG.ActionCost.action",
  reaction: "DIE_RPG.ActionCost.reaction",
  free: "DIE_RPG.ActionCost.free",
  passive: "DIE_RPG.ActionCost.passive",
  special: "DIE_RPG.ActionCost.special"
};

DIE_RPG.resourceCosts = {
  none: "DIE_RPG.ResourceCost.none",
  fair_gold: "DIE_RPG.ResourceCost.fair_gold",
  god_debt: "DIE_RPG.ResourceCost.god_debt",
  ek_scale: "DIE_RPG.ResourceCost.ek_scale",
  cheat_token: "DIE_RPG.ResourceCost.cheat_token",
  health: "DIE_RPG.ResourceCost.health",
  guard: "DIE_RPG.ResourceCost.guard",
  willpower: "DIE_RPG.ResourceCost.willpower"
};

DIE_RPG.attackTypes = {
  none: "DIE_RPG.AttackType.none",
  melee: "DIE_RPG.AttackType.melee",
  ranged: "DIE_RPG.AttackType.ranged",
  spell: "DIE_RPG.AttackType.spell"
};


DIE_RPG.rollModTypes = {
  none: "DIE_RPG.RollModType.none",
  advantage: "DIE_RPG.RollModType.advantage",
  disadvantage: "DIE_RPG.RollModType.disadvantage",
  add_dice: "DIE_RPG.RollModType.add_dice"
};