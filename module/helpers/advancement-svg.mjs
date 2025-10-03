/**
 * SVG helper functions for rendering the triangular advancement map
 */

// Triangle dimensions - increased for better readability
const TRIANGLE_HEIGHT = 180;
const TRIANGLE_WIDTH = 207.85; // sqrt(3)/2 * height for equilateral triangle
const HORIZONTAL_SPACING = TRIANGLE_WIDTH / 2; // Triangles share edges, so half-width spacing
const VERTICAL_SPACING = TRIANGLE_HEIGHT; // Full height for proper vertical alignment

/**
 * Parse nodeId into row and position
 * @param {string} nodeId - Node identifier like "row2-3"
 * @returns {{row: number, position: number}}
 */
function parseNodeId(nodeId) {
	const match = nodeId.match(/row(\d+)-(\d+)/);
	if (!match) return { row: 0, position: 1 };
	return {
		row: parseInt(match[1]),
		position: parseInt(match[2])
	};
}

/**
 * Determine if a triangle points up or down based on position in grid
 * @param {number} row - Row number
 * @param {number} position - Position in row
 * @returns {boolean} True if triangle points up (△), false if down (▽)
 */
function isPointingUp(row, position) {
	// Row 0 is always pointing down (START)
	if (row === 0) return false;

	// Alternating pattern based on row and position (reading from reference image)
	const rowPatterns = {
		1: [true, false, true, false, true],  // up, down, up, down, up
		2: [true, false],                      // up, down
		3: [true, false, true],                // up, down, up
		4: [true, false, true, false, true],   // up, down, up, down, up
		5: [false, true, true, false]          // down, up, up, down
	};

	return rowPatterns[row]?.[position - 1] ?? false;
}

/**
 * Calculate the center X coordinate for a row
 * @param {number} row - Row number
 * @param {number} totalPositions - Total number of triangles in this row
 * @returns {number} Center X coordinate
 */
function getRowCenterX(row, totalPositions) {
	const MAP_CENTER_X = 500; // Center of viewBox
	return MAP_CENTER_X;
}

/**
 * Calculate SVG polygon points for a triangle
 * @param {string} nodeId - Node identifier
 * @returns {string} SVG points attribute value
 */
export function getTrianglePoints(nodeId) {
	const { row, position } = parseNodeId(nodeId);
	const pointingUp = isPointingUp(row, position);

	// Row configuration: number of triangles per row
	const rowSizes = {
		0: 1,
		1: 5,
		2: 2,
		3: 3,
		4: 5,
		5: 4
	};

	const totalInRow = rowSizes[row] || 1;

	// Invert Y position so row 0 is at bottom
	// Row 5 should be at top, row 0 at bottom
	const invertedRow = 5 - row;
	const baseY = 50 + (invertedRow * VERTICAL_SPACING);

	// Calculate X position
	// Center the row, then offset by position
	const rowCenterX = getRowCenterX(row, totalInRow);
	let rowWidth = (totalInRow - 1) * HORIZONTAL_SPACING;

	// Row 5 has a gap between positions 2 and 3
	if (row === 5) {
		rowWidth += HORIZONTAL_SPACING; // Add extra space for the gap
	}

	const rowStartX = rowCenterX - (rowWidth / 2);
	let baseX = rowStartX + ((position - 1) * HORIZONTAL_SPACING);

	// Add gap offset for row 5 positions 3 and 4
	if (row === 5 && position >= 3) {
		baseX += HORIZONTAL_SPACING;
	}

	if (pointingUp) {
		// Triangle pointing up: △
		const top = `${baseX},${baseY}`;
		const bottomLeft = `${baseX - TRIANGLE_WIDTH / 2},${baseY + TRIANGLE_HEIGHT}`;
		const bottomRight = `${baseX + TRIANGLE_WIDTH / 2},${baseY + TRIANGLE_HEIGHT}`;
		return `${top} ${bottomLeft} ${bottomRight}`;
	} else {
		// Triangle pointing down: ▽
		const topLeft = `${baseX - TRIANGLE_WIDTH / 2},${baseY}`;
		const topRight = `${baseX + TRIANGLE_WIDTH / 2},${baseY}`;
		const bottom = `${baseX},${baseY + TRIANGLE_HEIGHT}`;
		return `${topLeft} ${topRight} ${bottom}`;
	}
}

/**
 * Calculate text position (centroid) for a triangle
 * @param {string} nodeId - Node identifier
 * @returns {{x: number, y: number}} Text anchor position
 */
export function getTextPosition(nodeId) {
	const { row, position } = parseNodeId(nodeId);
	const pointingUp = isPointingUp(row, position);

	const rowSizes = {
		0: 1, 1: 5, 2: 2, 3: 3, 4: 5, 5: 4
	};
	const totalInRow = rowSizes[row] || 1;

	// Invert Y position to match triangle layout
	const invertedRow = 5 - row;
	const baseY = 50 + (invertedRow * VERTICAL_SPACING);
	const rowCenterX = getRowCenterX(row, totalInRow);
	let rowWidth = (totalInRow - 1) * HORIZONTAL_SPACING;

	// Row 5 has a gap between positions 2 and 3
	if (row === 5) {
		rowWidth += HORIZONTAL_SPACING;
	}

	const rowStartX = rowCenterX - (rowWidth / 2);
	let baseX = rowStartX + ((position - 1) * HORIZONTAL_SPACING);

	// Add gap offset for row 5 positions 3 and 4
	if (row === 5 && position >= 3) {
		baseX += HORIZONTAL_SPACING;
	}

	// Centroid is 1/3 from base for equilateral triangle
	const textY = pointingUp
		? baseY + (TRIANGLE_HEIGHT * 0.6)  // Slightly below center for up triangles
		: baseY + (TRIANGLE_HEIGHT * 0.45); // Slightly above center for down triangles

	return {
		x: baseX,
		y: textY
	};
}

/**
 * Calculate the viewBox dimensions for the SVG
 * @returns {string} viewBox attribute value
 */
export function calculateViewBox() {
	// Based on 6 rows of triangles
	const width = 1000;
	const height = 100 + (6 * VERTICAL_SPACING) + 100; // Top padding + rows + bottom padding
	return `0 0 ${width} ${height}`;
}
