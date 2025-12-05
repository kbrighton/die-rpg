/**
 * SVG helper functions for rendering the D6 net (unfolded cube) widget
 * Used by the Fool paragon for tracking flukes on each face
 *
 * Layout (matching reference image):
 *         [1]
 *     [2][3][5][4]
 *         [6]
 */

// D6 face dimensions
const FACE_SIZE = 80;
const GAP = 5;
const PADDING = 8;

/**
 * Face position mapping - x,y coordinates for each face
 * Layout:
 *         [1]
 *   [2][3][5][4]
 *      [6]
 * Face 1 above face 5, face 6 below face 3
 * @type {Object.<string, {x: number, y: number}>}
 */
const FACE_POSITIONS = {
  '1': { x: (FACE_SIZE + GAP) * 2, y: 0 },                     // Top - above face 5
  '2': { x: 0, y: FACE_SIZE + GAP },                           // Middle left
  '3': { x: FACE_SIZE + GAP, y: FACE_SIZE + GAP },             // Middle center-left
  '5': { x: (FACE_SIZE + GAP) * 2, y: FACE_SIZE + GAP },       // Middle center-right
  '4': { x: (FACE_SIZE + GAP) * 3, y: FACE_SIZE + GAP },       // Middle right
  '6': { x: FACE_SIZE + GAP, y: (FACE_SIZE + GAP) * 2 }        // Bottom - below face 3
};

/**
 * Get the rectangle coordinates for a D6 face
 * @param {string|number} faceId - Face number (1-6)
 * @returns {{x: number, y: number, width: number, height: number}} Rectangle coordinates
 */
export function getD6FaceRect(faceId) {
  const pos = FACE_POSITIONS[String(faceId)];
  if (!pos) return { x: 0, y: 0, width: FACE_SIZE, height: FACE_SIZE };

  return {
    x: pos.x,
    y: pos.y,
    width: FACE_SIZE,
    height: FACE_SIZE
  };
}

/**
 * Get the center position for text/symbols on a face
 * @param {string|number} faceId - Face number (1-6)
 * @returns {{x: number, y: number}} Center coordinates
 */
export function getD6TextPosition(faceId) {
  const pos = FACE_POSITIONS[String(faceId)];
  if (!pos) return { x: FACE_SIZE / 2, y: FACE_SIZE / 2 };

  return {
    x: pos.x + FACE_SIZE / 2,
    y: pos.y + FACE_SIZE / 2
  };
}

/**
 * Get the upper-left position for face numbers (with padding)
 * @param {string|number} faceId - Face number (1-6)
 * @returns {{x: number, y: number}} Upper-left coordinates with padding
 */
export function getD6NumberPosition(faceId) {
  const pos = FACE_POSITIONS[String(faceId)];
  if (!pos) return { x: PADDING, y: PADDING };

  return {
    x: pos.x + PADDING,
    y: pos.y + PADDING
  };
}

/**
 * Get the viewBox dimensions for the D6 net SVG
 * @returns {string} viewBox attribute value
 */
export function getD6NetViewBox() {
  // Width: 4 faces + 3 gaps = 4*80 + 3*5 = 335, round up to 340
  // Height: 3 faces + 2 gaps = 3*80 + 2*5 = 250, round up to 255
  return '0 0 340 255';
}

/**
 * Get the symbol character for a given state
 * @param {string} state - State: "", "circle", or "cross"
 * @returns {string} Symbol character
 */
export function getD6StateSymbol(state) {
  switch (state) {
    case 'circle': return '○';
    case 'cross': return '×';
    default: return '';
  }
}

/**
 * Get the ordered list of face IDs for iteration
 * @returns {string[]} Array of face IDs in display order
 */
export function getD6FaceIds() {
  return ['1', '2', '3', '5', '4', '6'];
}
