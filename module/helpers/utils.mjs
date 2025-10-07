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
}
