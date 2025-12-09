export const DIE_RPG = {};

/**
 * The set of stat Scores used within the system.
 * @type {Object}
 */

DIE_RPG.stats = {
	str: "DIE_RPG.Stat.Str.long",
	dex: "DIE_RPG.Stat.Dex.long",
	con: "DIE_RPG.Stat.Con.long",
	int: "DIE_RPG.Stat.Int.long",
	wis: "DIE_RPG.Stat.Wis.long",
	cha: "DIE_RPG.Stat.Cha.long",
};

DIE_RPG.statAbbreviations = {
	str: "DIE_RPG.Stat.Str.abbr",
	dex: "DIE_RPG.Stat.Dex.abbr",
	con: "DIE_RPG.Stat.Con.abbr",
	int: "DIE_RPG.Stat.Int.abbr",
	wis: "DIE_RPG.Stat.Wis.abbr",
	cha: "DIE_RPG.Stat.Cha.abbr",
};

DIE_RPG.resources = {
	guard: "DIE_RPG.Resource.gua.long",
	health: "DIE_RPG.Resource.hea.long",
	willpower: "DIE_RPG.Resource.wil.long",
	defense: "DIE_RPG.Resource.def.long",
};

DIE_RPG.creatureTypes = {
	automatons: "DIE_RPG.Actor.NPC.CreatureTypes.automatons",
	bandits: "DIE_RPG.Actor.NPC.CreatureTypes.bandits",
	basilisks: "DIE_RPG.Actor.NPC.CreatureTypes.basilisks",
	bears: "DIE_RPG.Actor.NPC.CreatureTypes.bears",
	centaurs: "DIE_RPG.Actor.NPC.CreatureTypes.centaurs",
	chimeras: "DIE_RPG.Actor.NPC.CreatureTypes.chimeras",
	cockatrices: "DIE_RPG.Actor.NPC.CreatureTypes.cockatrices",
	demonLesser: "DIE_RPG.Actor.NPC.CreatureTypes.demon-lesser",
	demonGreater: "DIE_RPG.Actor.NPC.CreatureTypes.demon-greater",
	doppelgängers: "DIE_RPG.Actor.NPC.CreatureTypes.doppelgängers",
	dragons: "DIE_RPG.Actor.NPC.CreatureTypes.dragons",
	dwarves: "DIE_RPG.Actor.NPC.CreatureTypes.dwarves",
	elementalsAirFire: "DIE_RPG.Actor.NPC.CreatureTypes.elementals-air-fire",
	elementalsEarthWater: "DIE_RPG.Actor.NPC.CreatureTypes.elementals-earth-water",
	elves: "DIE_RPG.Actor.NPC.CreatureTypes.elves",
	gargoyles: "DIE_RPG.Actor.NPC.CreatureTypes.gargoyles",
	ghouls: "DIE_RPG.Actor.NPC.CreatureTypes.ghouls",
	giantWorms: "DIE_RPG.Actor.NPC.CreatureTypes.giant-worms",
	giants: "DIE_RPG.Actor.NPC.CreatureTypes.giants",
	goblins: "DIE_RPG.Actor.NPC.CreatureTypes.goblins",
	gorgons: "DIE_RPG.Actor.NPC.CreatureTypes.gorgons",
	griffins: "DIE_RPG.Actor.NPC.CreatureTypes.griffins",
	guards: "DIE_RPG.Actor.NPC.CreatureTypes.guards",
	halflings: "DIE_RPG.Actor.NPC.CreatureTypes.halflings",
	hounds: "DIE_RPG.Actor.NPC.CreatureTypes.hounds",
	hydras: "DIE_RPG.Actor.NPC.CreatureTypes.hydras",
	liches: "DIE_RPG.Actor.NPC.CreatureTypes.liches",
	minotaurs: "DIE_RPG.Actor.NPC.CreatureTypes.minotaurs",
	ogres: "DIE_RPG.Actor.NPC.CreatureTypes.ogres",
	orcs: "DIE_RPG.Actor.NPC.CreatureTypes.orcs",
	rats: "DIE_RPG.Actor.NPC.CreatureTypes.rats",
	sirens: "DIE_RPG.Actor.NPC.CreatureTypes.sirens",
	skeletons: "DIE_RPG.Actor.NPC.CreatureTypes.skeletons",
	snakes: "DIE_RPG.Actor.NPC.CreatureTypes.snakes",
	spiders: "DIE_RPG.Actor.NPC.CreatureTypes.spiders",
	treeSpirits: "DIE_RPG.Actor.NPC.CreatureTypes.tree-spirits",
	trolls: "DIE_RPG.Actor.NPC.CreatureTypes.trolls",
	unicorns: "DIE_RPG.Actor.NPC.CreatureTypes.unicorns",
	vampires: "DIE_RPG.Actor.NPC.CreatureTypes.vampires",
	werewolves: "DIE_RPG.Actor.NPC.CreatureTypes.werewolves",
	wizards: "DIE_RPG.Actor.NPC.CreatureTypes.wizards",
	wraiths: "DIE_RPG.Actor.NPC.CreatureTypes.wraiths",
	wyverns: "DIE_RPG.Actor.NPC.CreatureTypes.wyverns",
	zombies: "DIE_RPG.Actor.NPC.CreatureTypes.zombies"
};

DIE_RPG.classDice = {
	4: "d4",
	6: "d6",
	8: "d8",
	10: "d10",
	12: "d12",
	20: "d20",
};

/**
 * Die types for paragon class dice
 * @type {Object}
 */
DIE_RPG.dieTypes = {
	d4: "D4",
	d6: "D6",
	d8: "D8",
	d10: "D10",
	d12: "D12",
	d20: "D20",
};

DIE_RPG.stanceTypes = {
	COMBAT: "DIE_RPG.Item.Stance.FIELDS.stanceTypes.combat",
	SOCIAL: "DIE_RPG.Item.Stance.FIELDS.stanceTypes.social",
	EMOTION: "DIE_RPG.Item.Stance.FIELDS.stanceTypes.emotion"
};

DIE_RPG.rollModTypes = {
	none: "DIE_RPG.RollModType.none",
	advantage: "DIE_RPG.RollModType.advantage",
	disadvantage: "DIE_RPG.RollModType.disadvantage",
	add_dice: "DIE_RPG.RollModType.add_dice",
};

/**
 * Special ability cost types
 * @type {Object}
 */
DIE_RPG.specialCostTypes = {
	special: "DIE_RPG.SpecialCostType.special",
	double: "DIE_RPG.SpecialCostType.double",
	triple: "DIE_RPG.SpecialCostType.triple",
	quad: "DIE_RPG.SpecialCostType.quad",
	twenty: "DIE_RPG.SpecialCostType.twenty"
};

/**
 * Helper function to convert special cost type to numeric value for roll calculations
 * @param {string} costType - The cost type key (e.g., 'special', 'double', 'triple', 'quad', 'twenty')
 * @returns {number} The numeric cost value (1-4)
 */
DIE_RPG.getSpecialCostValue = function(costType) {
	const costMap = {
		special: 1,
		double: 2,
		triple: 3,
		quad: 4,
		twenty: 1  // 20-Special requires one nat 20, treated as cost 1 for 6+ counting
	};
	return costMap[costType] || 1;
};

// Paragon Advancement Map
DIE_RPG.PARAGON_ADVANCEMENT_MAP = {
	nodes: {
		"row0-1": { sides: ["row1-3"] },
		"row1-1": { sides: ["row1-2"] },
		"row1-2": { sides: ["row1-1", "row2-1", "row1-3"] },
		"row1-3": { sides: ["row0-1", "row1-2", "row1-4"] },
		"row1-4": { sides: ["row1-3", "row1-5"] },
		"row1-5": { sides: ["row1-4"] },
		"row2-1": { sides: ["row1-2", "row2-2"] },
		"row2-2": { sides: ["row2-1", "row3-3"] },
		"row3-1": { sides: ["row3-2"] },
		"row3-2": { sides: ["row3-1", "row3-3", "row4-3"] },
		"row3-3": { sides: ["row2-2", "row3-2"] },
		"row4-1": { sides: ["row4-2"] },
		"row4-2": { sides: ["row4-1", "row4-3", "row5-2"] },
		"row4-3": { sides: ["row3-2", "row4-2", "row4-4"] },
		"row4-4": { sides: ["row4-3", "row4-5", "row5-3"] },
		"row4-5": { sides: ["row4-4"] },
		"row5-1": { sides: ["row5-2"] },
		"row5-2": { sides: ["row4-2", "row5-1"] },
		"row5-3": { sides: ["row4-4", "row5-4"] },
		"row5-4": { sides: ["row5-3"] },
	},
};
