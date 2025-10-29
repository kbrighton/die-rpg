// Import document classes.
import { DieRpgActor } from './documents/actor.mjs';
import { DieRpgItem } from './documents/item.mjs';
// Import sheet classes.
import { DieRpgActorSheet } from './sheets/actor-sheet.mjs';
import { DieRpgItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { DIE_RPG } from './helpers/config.mjs';
import { initializeScrollIndicators } from './helpers/scroll-indicators.mjs';
import { DiceInteraction } from './helpers/dice-interaction.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
import * as utils from "./helpers/utils.mjs";

const collections = foundry.documents.collections;
const sheets = foundry.appv1.sheets;

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Add key classes to the global scope so they can be more easily used
// by downstream developers
globalThis.die_rpg = {
  documents: {
    DieRpgActor,
    DieRpgItem,
  },
  applications: {
    DieRpgActorSheet,
    DieRpgItemSheet,
  },
  utils: {
    rollItemMacro,
  },
  dice: {
    DiceInteraction,
  },
  models,
};

Hooks.once('init', function () {
  // Add custom constants for configuration.
  CONFIG.DIE_RPG = DIE_RPG;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '@stats.dex.value',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = DieRpgActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.DieRpgCharacter,
    npc: models.DieRpgNPC,
  };
  CONFIG.Item.documentClass = DieRpgItem;
  CONFIG.Item.dataModels = {
    equipment: models.DieRpgEquipment,
    paragon: models.DieRpgParagon,
    look: models.DieRpgLook,
    spell: models.DieRpgSpell,
    god: models.DieRpgGod,
    gift: models.DieRpgGift,
    stance: models.DieRpgStance,
    venting: models.DieRpgVenting,
    arcaneweapon: models.DieRpgArcaneWeapon,
  };

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  collections.Actors.unregisterSheet('core', sheets.ActorSheet);
  collections.Actors.registerSheet('die-rpg', DieRpgActorSheet, {
    makeDefault: true,
    label: 'DIE_RPG.SheetLabels.Actor',
  });
  collections.Items.unregisterSheet('core', sheets.ItemSheet);
  collections.Items.registerSheet('die-rpg', DieRpgItemSheet, {
    makeDefault: true,
    label: 'DIE_RPG.SheetLabels.Item',
  });

  // Register system settings
  game.settings.register('die-rpg', 'enableFailingForward', {
    name: 'DIE_RPG.Settings.enableFailingForward.name',
    hint: 'DIE_RPG.Settings.enableFailingForward.hint',
    scope: 'world', // GM controls this setting per world
    config: true, // Show in settings menu
    type: Boolean,
    default: true // Enabled by default
  });

  game.settings.register('die-rpg', 'enableCriticalFail', {
    name: 'DIE_RPG.Settings.enableCriticalFail.name',
    hint: 'DIE_RPG.Settings.enableCriticalFail.hint',
    scope: 'world', // GM controls this setting per world
    config: true, // Show in settings menu
    type: Boolean,
    default: true // Enabled by default
  });

  game.settings.register('die-rpg', 'enableDiceInteraction', {
    name: 'DIE_RPG.Settings.enableDiceInteraction.name',
    hint: 'DIE_RPG.Settings.enableDiceInteraction.hint',
    scope: 'world', // GM controls this setting per world
    config: true, // Show in settings menu
    type: Boolean,
    default: true // Enabled by default
  });

  utils.registerHandlebarsHelpers();
  // Preload Handlebars parts.
  utils.preloadHandlebarsTemplates();

  /* -------------------------------------------- */
  /*  Chat Message Hooks                          */
  /* -------------------------------------------- */

  // Register chat message hooks conditionally based on Foundry version
  // This prevents deprecation warnings in v13+ for the old hook
  if (game.release.generation >= 13) {
    // V13+: Use new renderChatMessageHTML hook
    Hooks.on('renderChatMessageHTML', (chatMessage, html, data) => {
      DiceInteraction.onRenderChatMessage(chatMessage, html, data);

      // Attach click listeners to dice elements
      for (const dieElement of html.querySelectorAll('.roll.die')) {
        dieElement.addEventListener('click', DiceInteraction._handleDieClick);
      }
    });
  } else {
    // V12: Use deprecated renderChatMessage hook
    Hooks.on('renderChatMessage', (chatMessage, html, data) => {
      // Apply styles for individual messages
      DiceInteraction.onRenderChatMessage(chatMessage, html[0], data);

      // Attach click listeners to dice elements
      for (const dieElement of html[0].querySelectorAll('.roll.die')) {
        dieElement.addEventListener('click', DiceInteraction._handleDieClick);
      }
    });
  }

  // renderChatLog hook works in both versions
  Hooks.on('renderChatLog', (chatLog, html, data) => {
    const htmlElement = game.release.generation >= 13 ? html : html[0];
    DiceInteraction.onRenderChatLog(chatLog, htmlElement, data);
  });
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('capitalize', function (str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Initialize scroll indicators for all elements with .scroll-indicators class
  initializeScrollIndicators();

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createDocMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createDocMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.dierpg.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'die-rpg.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

Hooks.on("renderSettings", (app, html) => {
	// --- Button Creation Logic (Common for both versions) ---
	const buttonsData = [
		{
			action: (ev) => {
				ev.preventDefault();
				window.open("https://rowanrookanddecard.com", "_blank");
			},
			iconClasses: ["fa-solid", "fa-book"],
			labelKey: "DIE_RPG.Settings.game.publisher.title",
		},
		{
			action: (ev) => {
				ev.preventDefault();
				window.open("https://github.com/philote/die-rpg", "_blank");
			},
			iconClasses: ["fab", "fa-github"],
			labelKey: "DIE_RPG.Settings.game.github.title",
		},
		{
			action: (ev) => {
				ev.preventDefault();
				window.open("https://ko-fi.com/ephson", "_blank");
			},
			iconClasses: ["fa-solid", "fa-mug-hot"],
			labelKey: "DIE_RPG.Settings.game.kofi.title",
		},
	];

	const buttons = buttonsData.map(({ action, iconClasses, labelKey }) => {
		const button = document.createElement("button");
		button.type = "button";

		const icon = document.createElement("i");
		icon.classList.add(...iconClasses);

		button.append(
			icon,
			document.createTextNode(` ${game.i18n.localize(labelKey)}`)
		);

		button.addEventListener("click", action);
		return button;
	});

	// --- Version Specific Logic ---
	if (game.release.generation >= 13) {
		// V13+ Logic: Append to the "Documentation" section
		const documentationSection = html.querySelector("section.documentation");
		if (documentationSection) {
			const divider = document.createElement("h4");
			divider.classList.add("divider");
			// Using a more specific key might be better, but reusing for now
			divider.textContent = game.i18n.localize("DIE_RPG.Settings.game.heading");

			// Append divider and then the buttons
			documentationSection.append(divider, ...buttons);
		}
	} else {
		// V12 Logic: Insert after the "Game Settings" section
		const gameSettingsSection = html[0].querySelector("#settings-game");
		if (gameSettingsSection) {
			const header = document.createElement("h2");
			header.innerText = game.i18n.localize("DIE_RPG.Settings.game.heading");

			const settingsDiv = document.createElement("div");
			settingsDiv.append(...buttons);

			// Insert the header and the div containing buttons after the game settings section
			gameSettingsSection.after(header, settingsDiv);
		}
	}
});