/**
 * Helper functions for managing and aggregating special abilities
 */

import { getParagonItem } from './advancements.mjs';

/**
 * Aggregates all special abilities from various sources for an actor
 * @param {Actor} actor - The actor to aggregate specials for
 * @returns {Array} Array of special objects with source information
 */
export async function getAggregatedSpecials(actor) {
  const specials = [];

  // Get specials from paragon
  const paragonItem = await getParagonItem(actor);
  if (paragonItem?.system?.specials) {
    for (const special of paragonItem.system.specials) {
      specials.push({
        ...special,
        source: 'paragon',
        sourceName: paragonItem.name
      });
    }
  }

  // Add specials from equipment
  const equipment = actor.items.filter(i => i.type === 'equipment');
  for (const item of equipment) {
    if (item.system.specials) {
      for (const special of item.system.specials) {
        specials.push({
          ...special,
          source: 'equipment',
          sourceName: item.name
        });
      }
    }
  }

  // Add specials from gifts (only if activated)
  const gifts = actor.items.filter(i => i.type === 'gift' && i.system.activated === true);
  for (const item of gifts) {
    if (item.system.upgrades) {
      for (const upgrade of item.system.upgrades) {
        if (upgrade.specials) {
          for (const special of upgrade.specials) {
            specials.push({
              ...special,
              source: 'gift',
              sourceName: `${item.name} - ${upgrade.name}`
            });
          }
        }
      }
    }
  }

  // Add specials from stances (only if active)
  const stances = actor.items.filter(i => i.type === 'stance' && i.system.active === true);
  for (const item of stances) {
    if (item.system.specials) {
      for (const special of item.system.specials) {
        specials.push({
          ...special,
          source: 'stance',
          sourceName: item.name
        });
      }
    }
  }

  // Add specials from spells
  const spells = actor.items.filter(i => i.type === 'spell');
  for (const item of spells) {
    if (item.system.specials) {
      for (const special of item.system.specials) {
        specials.push({
          ...special,
          source: 'spell',
          sourceName: item.name
        });
      }
    }
  }

  // Add specials from gods (from scriptures)
  const gods = actor.items.filter(i => i.type === 'god');
  for (const item of gods) {
    if (item.system.scriptures) {
      for (const scripture of item.system.scriptures) {
        if (scripture.specials) {
          for (const special of scripture.specials) {
            specials.push({
              ...special,
              source: 'god',
              sourceName: `${item.name} - ${scripture.name}`
            });
          }
        }
      }
    }
  }

  return specials;
}

/**
 * Synchronous version of getAggregatedSpecials for use in prepareDerivedData
 * Requires paragonItem to be passed in
 * @param {Actor} actor - The actor to aggregate specials for
 * @param {Item|null} paragonItem - The paragon item (if available)
 * @returns {Array} Array of special objects with source information
 */
export function getAggregatedSpecialsSync(actor, paragonItem = null) {
  const specials = [];

  // Get specials from paragon
  if (paragonItem?.system?.specials) {
    for (const special of paragonItem.system.specials) {
      specials.push({
        ...special,
        source: 'paragon',
        sourceName: paragonItem.name
      });
    }
  }

  // Add specials from equipment
  const equipment = actor.items.filter(i => i.type === 'equipment');
  for (const item of equipment) {
    if (item.system.specials) {
      for (const special of item.system.specials) {
        specials.push({
          ...special,
          source: 'equipment',
          sourceName: item.name
        });
      }
    }
  }

  // Add specials from gifts (only if activated)
  const gifts = actor.items.filter(i => i.type === 'gift' && i.system.activated === true);
  for (const item of gifts) {
    if (item.system.upgrades) {
      for (const upgrade of item.system.upgrades) {
        if (upgrade.specials) {
          for (const special of upgrade.specials) {
            specials.push({
              ...special,
              source: 'gift',
              sourceName: `${item.name} - ${upgrade.name}`
            });
          }
        }
      }
    }
  }

  // Add specials from stances (only if active)
  const stances = actor.items.filter(i => i.type === 'stance' && i.system.active === true);
  for (const item of stances) {
    if (item.system.specials) {
      for (const special of item.system.specials) {
        specials.push({
          ...special,
          source: 'stance',
          sourceName: item.name
        });
      }
    }
  }

  // Add specials from spells
  const spells = actor.items.filter(i => i.type === 'spell');
  for (const item of spells) {
    if (item.system.specials) {
      for (const special of item.system.specials) {
        specials.push({
          ...special,
          source: 'spell',
          sourceName: item.name
        });
      }
    }
  }

  // Add specials from gods (from scriptures)
  const gods = actor.items.filter(i => i.type === 'god');
  for (const item of gods) {
    if (item.system.scriptures) {
      for (const scripture of item.system.scriptures) {
        if (scripture.specials) {
          for (const special of scripture.specials) {
            specials.push({
              ...special,
              source: 'god',
              sourceName: `${item.name} - ${scripture.name}`
            });
          }
        }
      }
    }
  }

  return specials;
}
