/**
 * Helper functions for managing paragon advancement tracking
 */

/**
 * Get all unlocked advancement nodes for an actor
 * @param {Actor} actor - The actor to check
 * @returns {Set<string>} Set of unlocked node IDs
 */
export function getUnlockedNodes(actor) {
	const selected = actor.system.paragon.advancements;
	const unlocked = new Set();

	// Starting node is always unlocked if nothing selected
	if (selected.size === 0) {
		unlocked.add("row0-1");
		return unlocked;
	}

	// Find adjacent nodes to selected ones
	for (const nodeId of selected) {
		const node = CONFIG.DIE_RPG.PARAGON_ADVANCEMENT_MAP.nodes[nodeId];
		if (!node) continue;

		for (const adjacentId of node.sides) {
			if (!selected.has(adjacentId)) {
				unlocked.add(adjacentId);
			}
		}
	}

	return unlocked;
}

/**
 * Check if a specific node can be selected
 * @param {Actor} actor - The actor to check
 * @param {string} nodeId - The node ID to validate
 * @returns {boolean} True if the node can be selected
 */
export function canSelectNode(actor, nodeId) {
	const selected = actor.system.paragon.advancements;
	const unlocked = getUnlockedNodes(actor);
	const level = actor.system.level;

	// Can't select if already selected
	if (selected.has(nodeId)) return false;

	// Can't select if not unlocked
	if (!unlocked.has(nodeId)) return false;

	// Can't select if level requirement not met
	if (level <= selected.size) return false;

	return true;
}

/**
 * Check if a node is unlocked (but not selected)
 * @param {Actor} actor - The actor to check
 * @param {string} nodeId - The node ID to check
 * @returns {boolean} True if the node is unlocked
 */
export function isNodeUnlocked(actor, nodeId) {
	const selected = actor.system.paragon.advancements;
	const unlocked = getUnlockedNodes(actor);

	return !selected.has(nodeId) && unlocked.has(nodeId);
}

/**
 * Check if a node is selected
 * @param {Actor} actor - The actor to check
 * @param {string} nodeId - The node ID to check
 * @returns {boolean} True if the node is selected
 */
export function isNodeSelected(actor, nodeId) {
	return actor.system.paragon.advancements.has(nodeId);
}

/**
 * Check if a node is locked (neither selected nor unlocked)
 * @param {Actor} actor - The actor to check
 * @param {string} nodeId - The node ID to check
 * @returns {boolean} True if the node is locked
 */
export function isNodeLocked(actor, nodeId) {
	return !isNodeSelected(actor, nodeId) && !isNodeUnlocked(actor, nodeId);
}
