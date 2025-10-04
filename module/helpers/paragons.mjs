/**
 * Helper functions for managing paragon items
 */

/**
 * Retrieves a list of Paragon items from the world and compendiums
 * and caches them in CONFIG.DIE_RPG.paragons
 * @returns {Promise<Array>} Array of {name, uuid}
 */
export async function getParagons() {
	// Return cached if available
	if (CONFIG.DIE_RPG.paragons?.length) {
		return CONFIG.DIE_RPG.paragons;
	}

	// Retrieve paragons from world items
	let paragons = game.items.filter((item) => item.type === 'paragon');

	// Retrieve paragons from compendiums and merge them in
	for (let pack of game.packs) {
		if (pack.metadata.type !== 'Item') continue;
		paragons = paragons.concat(await pack.getDocuments({ type: 'paragon' }));
	}

	// Sort alphabetically and cache
	const sortedParagons = paragons.sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
	);

	CONFIG.DIE_RPG.paragons = sortedParagons.map((p) => ({
		name: p.name,
		uuid: p.uuid
	}));

	return CONFIG.DIE_RPG.paragons;
}
