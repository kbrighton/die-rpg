/**
 * Helper functions for managing paragon advancement tracking
 */

/**
 * Get the paragon item for an actor
 * @param {Actor} actor - The actor
 * @returns {Item|null} The paragon item or null
 */
export async function getParagonItem(actor) {
	// Try to get from UUID first
	const paragonUuid = actor.system.paragon?.uuid;
	if (paragonUuid) {
		try {
			const item = await fromUuid(paragonUuid);
			if (item && item.type === 'paragon') {
				return item;
			}
		} catch (err) {
			console.warn(`DIE RPG | Failed to load paragon item from UUID: ${paragonUuid}`, err);
		}
	}

	// Fallback: find first paragon item owned by actor
	return actor.items.find(i => i.type === 'paragon') || null;
}

/**
 * Get the advancement number assigned to a specific node position
 * @param {Actor} actor - The actor
 * @param {string} nodeId - Node identifier (e.g., "row1-2")
 * @returns {number|null} The advancement ID number or null if not found
 */
export async function getAdvancementNumber(actor, nodeId) {
	const paragonItem = await getParagonItem(actor);
	if (!paragonItem?.system?.advancementAssignments) return null;

	return paragonItem.system.advancementAssignments[nodeId] ?? null;
}

/**
 * Get the advancement number assigned to a specific node position (synchronous version)
 * @param {Item} paragonItem - The paragon item
 * @param {string} nodeId - Node identifier (e.g., "row1-2")
 * @returns {number|null} The advancement ID number or null if not found
 */
export function getAdvancementNumberSync(paragonItem, nodeId) {
	if (!paragonItem?.system?.advancementAssignments) return null;
	return paragonItem.system.advancementAssignments[nodeId] ?? null;
}

/**
 * Get the full advancement details for a node position
 * @param {Actor} actor - The actor
 * @param {string} nodeId - Node identifier (e.g., "row1-2")
 * @returns {Object|null} Advancement object {id, name, description, icon} or null
 */
export async function getAdvancementDetails(actor, nodeId) {
	const paragonItem = await getParagonItem(actor);
	if (!paragonItem) return null;

	const advancementId = paragonItem.system.advancementAssignments?.[nodeId];
	if (!advancementId) return null;

	return paragonItem.system.advancements?.find(a => a.id === advancementId) ?? null;
}

/**
 * Get the full advancement details for a node position (synchronous version)
 * @param {Item} paragonItem - The paragon item
 * @param {string} nodeId - Node identifier (e.g., "row1-2")
 * @returns {Object|null} Advancement object {id, name, description, icon} or null
 */
export function getAdvancementDetailsSync(paragonItem, nodeId) {
	if (!paragonItem) return null;

	const advancementId = paragonItem.system.advancementAssignments?.[nodeId];
	if (!advancementId) return null;

	return paragonItem.system.advancements?.find(a => a.id === advancementId) ?? null;
}

/**
 * Get all node positions that use a specific advancement ID
 * @param {Actor} actor - The actor
 * @param {number} advancementId - The advancement ID
 * @returns {Array<string>} Array of node IDs (e.g., ["row1-1", "row3-2"])
 */
export async function getAdvancementPositions(actor, advancementId) {
	const paragonItem = await getParagonItem(actor);
	if (!paragonItem?.system?.advancementAssignments) return [];

	const positions = [];
	for (const [nodeId, aId] of Object.entries(paragonItem.system.advancementAssignments)) {
		if (aId === advancementId) {
			positions.push(nodeId);
		}
	}
	return positions;
}

/**
 * Get all node positions that use a specific advancement ID (synchronous version)
 * @param {Item} paragonItem - The paragon item
 * @param {number} advancementId - The advancement ID
 * @returns {Array<string>} Array of node IDs (e.g., ["row1-1", "row3-2"])
 */
export function getAdvancementPositionsSync(paragonItem, advancementId) {
	if (!paragonItem?.system?.advancementAssignments) return [];

	const positions = [];
	for (const [nodeId, aId] of Object.entries(paragonItem.system.advancementAssignments)) {
		if (aId === advancementId) {
			positions.push(nodeId);
		}
	}
	return positions;
}

/**
 * Get all unique advancements with their positions and states
 * Used for the accordion display
 * @param {Actor} actor - The actor
 * @returns {Array} Array of {advancement, positions: [{nodeId, state}]}
 */
export async function getAdvancementsWithPositions(actor) {
	const paragonItem = await getParagonItem(actor);
	if (!paragonItem?.system?.advancements) return [];

	const result = [];

	for (const advancement of paragonItem.system.advancements) {
		const positions = await getAdvancementPositions(actor, advancement.id);
		const positionsWithStates = positions.map(nodeId => ({
			nodeId,
			selected: isNodeSelected(actor, nodeId),
			state: getNodeDisabledReason(actor, nodeId) || 'available'
		}));

		result.push({
			advancement,
			positions: positionsWithStates
		});
	}

	return result;
}

/**
 * Get all unique advancements with their positions and states (synchronous version)
 * Used for the accordion display
 * @param {Item} paragonItem - The paragon item
 * @param {Actor} actor - The actor (for state checking)
 * @returns {Array} Array of {advancement, positions: [{nodeId, state}]}
 */
export function getAdvancementsWithPositionsSync(paragonItem, actor) {
	if (!paragonItem?.system?.advancements) return [];

	const result = [];

	for (const advancement of paragonItem.system.advancements) {
		const positions = getAdvancementPositionsSync(paragonItem, advancement.id);
		const positionsWithStates = positions.map(nodeId => ({
			nodeId,
			selected: isNodeSelected(actor, nodeId),
			state: getNodeDisabledReason(actor, nodeId) || 'available'
		}));

		result.push({
			advancement,
			positions: positionsWithStates
		});
	}

	return result;
}

/**
 * Get all selected nodes that are reachable from the starting node
 * Used to detect orphaned nodes after deselection
 * @param {Actor} actor - The actor to check
 * @returns {Set<string>} Set of reachable selected node IDs
 */
export function getReachableNodes(actor) {
	if (!actor?.system?.paragon?.advancements) return new Set();
	const selected = actor.system.paragon.advancements;
	const reachable = new Set();
	const queue = ["row0-1"];

	// Breadth-first search from starting node through selected nodes
	while (queue.length > 0) {
		const nodeId = queue.shift();

		// Skip if not selected or already processed
		if (!selected.has(nodeId) || reachable.has(nodeId)) continue;

		// Mark as reachable
		reachable.add(nodeId);

		// Add adjacent selected nodes to queue
		const node = CONFIG.DIE_RPG.PARAGON_ADVANCEMENT_MAP.nodes[nodeId];
		if (!node) continue;

		for (const adjacentId of node.sides) {
			if (selected.has(adjacentId) && !reachable.has(adjacentId)) {
				queue.push(adjacentId);
			}
		}
	}

	return reachable;
}

/**
 * Get all unlocked advancement nodes for an actor
 * @param {Actor} actor - The actor to check
 * @returns {Set<string>} Set of unlocked node IDs
 */
export function getUnlockedNodes(actor) {
	if (!actor?.system?.paragon?.advancements) return new Set();
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
	if (!actor?.system?.paragon?.advancements) return false;
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
	if (!actor?.system?.paragon?.advancements) return false;
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
	if (!actor?.system?.paragon?.advancements) return false;
	return actor.system.paragon.advancements.has(nodeId);
}

/**
 * Check if a node is locked (neither selected nor unlocked)
 * @param {Actor} actor - The actor to check
 * @param {string} nodeId - The node ID to check
 * @returns {boolean} True if the node is locked
 */
export function isNodeLocked(actor, nodeId) {
	if (!actor?.system?.paragon?.advancements) return true;
	return !isNodeSelected(actor, nodeId) && !isNodeUnlocked(actor, nodeId);
}

/**
 * Get the reason why a node is disabled, if any
 * @param {Actor} actor - The actor to check
 * @param {string} nodeId - The node ID to check
 * @returns {string|null} "selected", "locked", "level", or null if can be selected
 */
export function getNodeDisabledReason(actor, nodeId) {
	if (!actor?.system?.paragon?.advancements) return "locked";

	const selected = actor.system.paragon.advancements;
	const unlocked = getUnlockedNodes(actor);
	const level = actor.system.level;

	// Already selected
	if (selected.has(nodeId)) return "selected";

	// Not adjacent to selected nodes
	if (!unlocked.has(nodeId)) return "locked";

	// Level requirement not met
	if (level <= selected.size) return "level";

	// Can be selected
	return null;
}
