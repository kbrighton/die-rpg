import {
  canSelectNode,
  isNodeSelected,
  isNodeLocked,
  getNodeDisabledReason,
  getAdvancementNumberSync,
  getAdvancementDetailsSync,
  getAdvancementsWithPositionsSync
} from './advancements.mjs';
import {
  getTrianglePoints,
  getTextPosition,
  calculateViewBox
} from './advancement-svg.mjs';

/**
 * Preload Handlebars templates for partials and components
 * @returns {Promise}
 */
export async function preloadHandlebarsTemplates() {
  return foundry.applications.handlebars.loadTemplates([
	// Partial templates
	'systems/die-rpg/templates/partials/dynamic-field.hbs',
	'systems/die-rpg/templates/partials/number-spinner.hbs',
  ]);
}

/**
 * Register custom Handlebars helpers.
 */
export function registerHandlebarsHelpers() {
    // If you need to add Handlebars helpers, here is a useful example:
    Handlebars.registerHelper("toLowerCase", function (str) {
        return str?.toLowerCase() || str;
    });

    Handlebars.registerHelper("uppercase", function (str) {
        return str?.toUpperCase() || str;
    });

    /**
	 * Repeats a given block N-times.
	 * @param {number} n	The number of times the block is repeated.
	 * @param {object} options	Helper options
	 * @param {number} [options.start]	The starting index number.
	 * @param {boolean} [options.reverse] Invert the index number.
	 * @returns {string}
	 */
    Handlebars.registerHelper("times", function (n, options) {
        let accum = "";
		let data;
		if (options.data) {
			data = Handlebars.createFrame(options.data);
		}
		let { start = 0, reverse = false } = options.hash;
		for (let i = 0; i < n; ++i) {
			if (data) {
				data.index = reverse ? (n - i - 1 + start) : (i + start);
				data.first = i === 0;
				data.last = i === (n - 1);
			}
			accum += options.fn(i, { data: data });
		}
		return accum;
    });

	Handlebars.registerHelper("inc", function(value, options) {
		const newVale = parseInt(value) + 1;
		return newVale;
	});

	Handlebars.registerHelper("add", function(a, b) {
		return a + b;
	});

	Handlebars.registerHelper("subtract", function(a, b) {
		return a - b;
	});

	/**
	 * Partitions an array into two groups based on a condition.
	 * @param {Array} array - The array to partition
	 * @param {string} property - The property to check
	 * @param {number|string} value - The value to compare against
	 * @param {string} operator - The operator to use (eq, ne, gt, lt, ge, le)
	 * @returns {Object} An object with success and failure arrays
	 */
	Handlebars.registerHelper("partition", function(array, property, value, operator) {
		if (!array || !array.length) return { success: [], failure: [] };
		
		const success = [];
		const failure = [];
		
		for (const item of array) {
			const itemValue = foundry.utils.getProperty(item, property);
			let condition = false;
			
			switch (operator) {
				case "eq": condition = itemValue == value; break;
				case "ne": condition = itemValue != value; break;
				case "gt": condition = itemValue > value; break;
				case "lt": condition = itemValue < value; break;
				case "ge": condition = itemValue >= value; break;
				case "le": condition = itemValue <= value; break;
				default: condition = false;
			}
			
			if (condition) {
				success.push(item);
			} else {
				failure.push(item);
			}
		}

		return { success, failure };
	});

	// Advancement helpers
	Handlebars.registerHelper('isNodeSelected', function(actor, nodeId) {
		return isNodeSelected(actor, nodeId);
	});

	Handlebars.registerHelper('canSelectNode', function(actor, nodeId) {
		return canSelectNode(actor, nodeId);
	});

	Handlebars.registerHelper('isNodeLocked', function(actor, nodeId) {
		return isNodeLocked(actor, nodeId);
	});

	Handlebars.registerHelper('getNodeDisabledReason', function(actor, nodeId) {
		return getNodeDisabledReason(actor, nodeId);
	});

	// SVG advancement map helpers
	Handlebars.registerHelper('svgTrianglePoints', function(nodeId) {
		return getTrianglePoints(nodeId);
	});

	Handlebars.registerHelper('svgTextX', function(nodeId) {
		return getTextPosition(nodeId).x;
	});

	Handlebars.registerHelper('svgTextY', function(nodeId) {
		return getTextPosition(nodeId).y;
	});

	Handlebars.registerHelper('svgViewBox', function() {
		return calculateViewBox();
	});

	// Paragon advancement data helpers
	// These expect paragonItem to be passed from the template context
	Handlebars.registerHelper('getAdvancementNumber', function(paragonItem, nodeId) {
		const num = getAdvancementNumberSync(paragonItem, nodeId);
		return num ?? '?';
	});

	Handlebars.registerHelper('getAdvancementName', function(paragonItem, nodeId) {
		const details = getAdvancementDetailsSync(paragonItem, nodeId);
		return details?.name ?? 'Unknown';
	});

	Handlebars.registerHelper('getAdvancementsWithPositions', function(paragonItem, actor) {
		return getAdvancementsWithPositionsSync(paragonItem, actor);
	});

	// Format nodeId for display - converts "row1-2" to "1-2"
	Handlebars.registerHelper('formatNodeId', function(nodeId) {
		return nodeId?.replace(/^row/, '') || nodeId;
	});

	// Check if the selected look is custom
	Handlebars.registerHelper('isCustomLook', function(selectedLook) {
		// Show custom input only when "Custom Look" is explicitly selected
		return selectedLook === '___CUSTOM___';
	});

	// ========================================
	// DICE ICON HELPERS
	// ========================================

	/**
	 * Gets the path to the die icon SVG for a given die type.
	 * @param {string} dieType - The die type (e.g., "d6", "d4", "d8", "d10", "d12", "d20")
	 * @returns {string} The path to the SVG icon
	 */
	Handlebars.registerHelper('getDieIconPath', function(dieType) {
		// dieType is like "d6", "d4", "d8", etc.
		// Clean it and extract the number
		const cleanType = (dieType || 'd6').toLowerCase().replace(/[^0-9]/g, '');
		return `systems/die-rpg/assets/icons/dice/d${cleanType}.svg`;
	});

	// Math helpers for positioning
	Handlebars.registerHelper('subtract', function(a, b) {
		return a - b;
	});

	Handlebars.registerHelper('add', function(a, b) {
		return a + b;
	});

	// ========================================
	// DYNAMIC FIELD RENDERING HELPERS
	// ========================================

	/**
	 * Equality helper for comparing values in templates
	 * @param {*} a - First value
	 * @param {*} b - Second value
	 * @returns {boolean} True if equal
	 */
	Handlebars.registerHelper('eq', function(a, b) {
		return a === b;
	});

	/**
	 * Checked helper for checkbox inputs
	 * @param {boolean} value - The boolean value
	 * @returns {string} "checked" if true, empty string if false
	 */
	Handlebars.registerHelper('checked', function(value) {
		return value ? 'checked' : '';
	});

	/**
	 * Contains helper for checking if array contains a value
	 * @param {Array} array - Array to search
	 * @param {*} value - Value to find
	 * @returns {boolean} True if array contains value
	 */
	Handlebars.registerHelper('contains', function(array, value) {
		if (!Array.isArray(array)) return false;
		return array.includes(value);
	});

	/**
	 * Concat helper for concatenating strings
	 * @param {...string} args - Strings to concatenate
	 * @returns {string} Concatenated string
	 */
	Handlebars.registerHelper('concat', function(...args) {
		// Last argument is Handlebars options object, remove it
		args.pop();
		return args.join('');
	});

	/**
	 * Lookup helper for accessing nested properties by key
	 * Note: Foundry may have this built-in, but adding it for safety
	 * @param {Object} object - Object to look up property in
	 * @param {string} key - Property key
	 * @returns {*} Property value
	 */
	Handlebars.registerHelper('lookup', function(object, key) {
		if (!object || key === undefined) return undefined;
		return object[key];
	});

	/**
	 * JSON stringify helper for displaying objects in textareas
	 * @param {*} context - The value to stringify
	 * @param {Object} options - Handlebars options object with hash parameters
	 * @param {number} [options.hash.space] - Number of spaces for indentation (default: 0)
	 * @returns {Handlebars.SafeString} JSON string
	 */
	Handlebars.registerHelper('json', function(context, options) {
		if (context === null || context === undefined) return '';
		const space = options.hash.space || 0;
		return new Handlebars.SafeString(JSON.stringify(context, null, space));
	});
}
