#!/usr/bin/env node
/**
 * Generate Foundry VTT compatible 16-character alphanumeric IDs
 *
 * Usage:
 *   node tools/generate-id.mjs           # Generate 1 ID
 *   node tools/generate-id.mjs 10        # Generate 10 IDs
 *   node tools/generate-id.mjs 5 --json  # Generate 5 IDs as JSON array
 */

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 16;

/**
 * Generate a single Foundry-compatible ID
 * @returns {string} A 16-character alphanumeric ID
 */
function generateId() {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return id;
}

/**
 * Generate multiple unique IDs
 * @param {number} count - Number of IDs to generate
 * @returns {string[]} Array of unique IDs
 */
function generateIds(count) {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(generateId());
  }
  return Array.from(ids);
}

// Parse command line arguments
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 1;
const asJson = args.includes('--json');

const ids = generateIds(count);

if (asJson) {
  console.log(JSON.stringify(ids, null, 2));
} else {
  ids.forEach(id => console.log(id));
}
