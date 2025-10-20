import { prepareActiveEffectCategories } from '../helpers/effects.mjs';
import { rollStat } from "../helpers/dice.mjs";
import { getParagonItem } from "../helpers/advancements.mjs";
import { getParagons } from "../helpers/paragons.mjs";
import { getAggregatedSpecials } from "../helpers/specials.mjs";

const { api, sheets, ux } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class DieRpgActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['die-rpg', 'actor'],
    position: {
      width: 800,
      height: 800,
    },
    window: {
			resizable: true,
		},
    actions: {
      onEditImage: this._onEditImage,
      viewDoc: this._viewDoc,
      createDoc: this._createDoc,
      deleteDoc: this._deleteDoc,
      toggleEffect: this._toggleEffect,
      roll: this._onRoll,
      statRoll: this._onStatRoll,
      toggleAdvancement: this._toggleAdvancement,
      viewParagon: this._viewParagon,
      resetFlashback: this._resetFlashback,
      createItemForList: this._onCreateItemForList,
      toggleItemDetails: this._onToggleItemDetails,
    },
    // dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/die-rpg/templates/actor/header.hbs',
    },
    sidebar: {
      template: 'systems/die-rpg/templates/actor/sidebar.hbs',
      scrollable: [""],
    },
    stats: {
      template: 'systems/die-rpg/templates/actor/stats.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    // Tab sheets
    paragon: {
      template: 'systems/die-rpg/templates/actor/paragon.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    advancements: {
      template: 'systems/die-rpg/templates/actor/advancements.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    persona: {
      template: 'systems/die-rpg/templates/actor/persona.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    notes: {
      template: 'systems/die-rpg/templates/actor/notes.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = ['header', 'sidebar', 'stats', 'tabs'];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'character':
        options.parts.push('paragon', 'advancements', 'persona');
        break;
      case 'npc':
        // options.parts.push();
        break;
    }
    options.parts.push('notes');
  }

  /* -------------------------------------------- */

  /**
   * Enrich HTML content for dynamic fields
   * @param {Array} fieldDefinitions - Array of field definitions from paragon
   * @param {Object} fieldData - Object containing field values
   * @returns {Object} Object mapping field keys to enriched HTML
   * @private
   */
  async _enrichDynamicFields(fieldDefinitions, fieldData) {
    const enriched = {};

    for (const field of fieldDefinitions) {
      if (field.type === 'html') {
        const rawValue = fieldData?.[field.key] || '';
        enriched[field.key] = await ux.TextEditor.enrichHTML(
          rawValue,
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
      } else if (field.type === 'group' && field.fields) {
        // Recursively enrich nested group fields
        const groupData = fieldData?.[field.key] || {};
        enriched[field.key] = {};
        for (const subfield of field.fields) {
          if (subfield.type === 'html') {
            const rawValue = groupData[subfield.key] || '';
            enriched[field.key][subfield.key] = await ux.TextEditor.enrichHTML(
              rawValue,
              {
                secrets: this.document.isOwner,
                rollData: this.actor.getRollData(),
                relativeTo: this.actor,
              }
            );
          }
        }
      }
    }

    return enriched;
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    // Output initialization
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.isOwner,
      limited: this.document.limited,
      // Add the actor document.
      actor: this.actor,
      // Add the actor's data to context.data for easier access, as well as flags.
      system: this.actor.system,
      flags: this.actor.flags,
      // Adding a pointer to CONFIG.DIE_RPG
      config: CONFIG.DIE_RPG,
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,

      // Fetch paragon item data for advancements
      paragonItem: await getParagonItem(this.actor),
      // Fetch available paragons for selection dropdown
      paragons: await getParagons() || [],
      // Fetch aggregated specials from all sources
      aggregatedSpecials: await getAggregatedSpecials(this.actor),
    };

    // Enrich dynamic HTML fields from class abilities and advancement forms
    context.enrichedClassAbilityData = {};
    context.enrichedAdvancementData = {};

    if (context.paragonItem) {
      if (context.paragonItem.system.classAbilities?.fields?.length) {
        context.enrichedClassAbilityData = await this._enrichDynamicFields(
          context.paragonItem.system.classAbilities.fields,
          this.actor.system.paragon.classAbilityData
        );
      }

      if (context.paragonItem.system.advancementForms?.fields?.length) {
        context.enrichedAdvancementData = await this._enrichDynamicFields(
          context.paragonItem.system.advancementForms.fields,
          this.actor.system.paragon.advancementData
        );
      }
    }

    // Offloading context prep to a helper function
    this._prepareItems(context);

    // Enrich item descriptions for itemList fields
    context.enrichedItemDescriptions = {};
    for (const item of this.actor.items) {
      if (item.system.description) {
        context.enrichedItemDescriptions[item.id] = await ux.TextEditor.enrichHTML(
          item.system.description,
          {
            relativeTo: item,
            secrets: item.isOwner,
            async: true
          }
        );
      }
    }

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'paragon':
        context.tab = context.tabs[partId];
        break;
      case 'persona':
        context.tab = context.tabs[partId];
        // Enrich persona notes for display
        context.enrichedPersonaNotes = await ux.TextEditor.enrichHTML(
          this.actor.system.persona.notes,
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
        break;
      case 'advancements':
        context.tab = context.tabs[partId];
        break;
      case 'notes':
        context.tab = context.tabs[partId];
        // Enrich biography info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedNotes = await ux.TextEditor.enrichHTML(
          this.actor.system.notes,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
    }
    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'paragon';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'DIE_RPG.Actor.Tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
        case 'sidebar':
        case 'stats':
          return tabs;
        case 'paragon':
          tab.id = 'paragon';
          tab.label += 'Paragon';
          break;
        case 'advancements':
          tab.id = 'advancements';
          tab.label += 'Advancements';
          break;
        case 'persona':
          tab.id = 'persona';
          tab.label += 'Persona';
          break;
        case 'notes':
          tab.id = 'notes';
          tab.label += 'Notes';
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    // You can just use `this.document.itemTypes` instead
    // if you don't need to subdivide a given type like
    // this sheet does with abilities
    // const equipment = [];

    // Iterate through items, allocating to containers
    for (let i of this.document.items) {
      // // Append to equipment.
      // if (i.type === 'equipment') {
      //   equipment.push(i);
      // }
      // // Append to features.
      // else if (i.type === 'feature') {
      //   features.push(i);
      // }
      // // Append to abilities.
      // else if (i.type === 'ability') { // Changed from 'spell'
      //   abilities.push(i); // Changed from level-based push
      // }
    }

    // Sort then assign
    // context.equipment = equipment.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    // context.features = features.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    // context.abilities = abilities.sort((a, b) => (a.sort || 0) - (b.sort || 0)); // Changed from spells
  }

  /**
   * Process form data to handle multi-select checkboxes
   * @param {SubmitEvent} event             The form submission event
   * @param {HTMLFormElement} form          The form element
   * @param {FormDataExtended} formData     Processed form data
   * @returns {object}                      Expanded form data
   * @protected
   * @override
   */
  _processFormData(event, form, formData) {
    const rawData = formData.object;

    // Expand object FIRST to create proper nested structure
    // This prevents conflicts between flat keys and nested objects
    const expandedData = foundry.utils.expandObject(rawData);

    // Handle multi-select checkboxes from dynamic fields
    const multiSelects = form.querySelectorAll('input[type="checkbox"][data-multi-select]');
    const multiSelectGroups = {};

    for (const checkbox of multiSelects) {
      const fieldPath = checkbox.dataset.multiSelect;
      if (!multiSelectGroups[fieldPath]) {
        multiSelectGroups[fieldPath] = [];
      }
      if (checkbox.checked) {
        multiSelectGroups[fieldPath].push(checkbox.value);
      }
    }

    // Set the collected values on the EXPANDED object
    // Always set arrays, even if empty, to properly save unchecked states
    for (const [path, values] of Object.entries(multiSelectGroups)) {
      foundry.utils.setProperty(expandedData, path, values);
    }

    return expandedData;
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#disableOverrides();

    // Handle paragon selection with custom logic
    const paragonSelect = this.element.querySelector("#paragon-select");
    if (paragonSelect) {
      paragonSelect.addEventListener("change", this._selectParagon.bind(this));
    }
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  /**
   * Handle changing a Document's image.
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @protected
   */
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Renders an embedded document's sheet
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  /**
   * Handles item deletion
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    await doc.delete();
  }

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _createDoc(event, target) {
    // Retrieve the configured document class for Item or ActiveEffect
    const docCls = getDocumentClass(target.dataset.documentClass);
    // Prepare the document creation data by initializing it a default name.
    const docData = {
      name: docCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(docData, dataKey, value);
    }

    // Finally, create the embedded document!
    await docCls.create(docData, { parent: this.actor });
  }

  /**
   * Determines effect parent to pass to helper
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    await effect.update({ disabled: !effect.disabled });
  }

  /**
   * Handle clickable rolls.
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _onRoll(event, target) {
    event.preventDefault();
    const dataset = target.dataset;

    // Handle item rolls.
    switch (dataset.rollType) {
      case 'item':
        const item = this._getEmbeddedDocument(target);
        if (item) return item.roll();
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  static async _onStatRoll(event, target) {
    event.preventDefault();
    const dataset = target.dataset;

    return rollStat(dataset, this.actor);
  }

  /**
   * Handle opening the paragon item sheet
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _viewParagon(event, target) {
    event.preventDefault();
    const paragonItem = this.actor.items.find(i => i.type === 'paragon');
    if (paragonItem) {
      paragonItem.sheet.render(true);
    } else {
      ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.NoParagon"));
    }
  }

  /**
   * Handle toggling advancement node selection
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _toggleAdvancement(event, target) {
    event.preventDefault();

    const nodeId = target.dataset.nodeId;
    const currentAdvancements = new Set(this.actor.system.paragon.advancements);

    // Toggle: if selected, remove; if not selected, add (if allowed)
    if (currentAdvancements.has(nodeId)) {
      // Remove the node
      currentAdvancements.delete(nodeId);

      // Check for orphaned nodes and remove them
      const { getReachableNodes } = await import('../helpers/advancements.mjs');
      const orphanedNodes = new Set();

      // Create a temporary actor-like object to test reachability
      const tempActor = {
        system: {
          paragon: { advancements: currentAdvancements },
          level: this.actor.system.level
        }
      };

      // Find all nodes that are now orphaned (selected but not reachable from start)
      const reachable = getReachableNodes(tempActor);
      for (const selectedId of currentAdvancements) {
        if (!reachable.has(selectedId)) {
          orphanedNodes.add(selectedId);
        }
      }

      // Remove orphaned nodes
      for (const orphanId of orphanedNodes) {
        currentAdvancements.delete(orphanId);
      }

      if (orphanedNodes.size > 0) {
        ui.notifications.info(game.i18n.format("DIE_RPG.Notifications.Success.OrphanedAdvancementsRemoved", {count: orphanedNodes.size}));
      }
    } else {
      // Validate before adding
      const { canSelectNode } = await import('../helpers/advancements.mjs');
      if (canSelectNode(this.actor, nodeId)) {
        currentAdvancements.add(nodeId);
      } else {
        ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.CannotSelectAdvancement"));
        return;
      }
    }

    // Update the actor with the new Set
    await this.actor.update({
      'system.paragon.advancements': Array.from(currentAdvancements)
    });
  }

  /**
   * Handle resetting flashback usage
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _resetFlashback(event, target) {
    event.preventDefault();
    await this.actor.update({ 'system.flashbackUsed': false });
    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.FlashbackReset"));
  }

  /**
   * Create a new item of specified type for an itemList field
   * Opens the newly created item's sheet for immediate editing
   *
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element with data attributes
   * @protected
   */
  static async _onCreateItemForList(event, target) {
    event.preventDefault();

    const itemType = target.dataset.itemType;

    if (!itemType) {
      ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.NoItemType"));
      return;
    }

    // Prepare the document creation data
    const capitalizedType = itemType.charAt(0).toUpperCase() + itemType.slice(1);
    const itemData = {
      name: game.i18n.localize(`DIE_RPG.UI.DefaultItemNames.${capitalizedType}`),
      type: itemType
    };

    // Create the embedded document
    const created = await this.actor.createEmbeddedDocuments('Item', [itemData]);

    // Open the newly created item's sheet for editing
    if (created?.[0]) {
      created[0].sheet.render(true);
    }
  }

  /**
   * Toggle the visibility of item details in itemList fields
   * Expands/collapses a row to show item description and metadata
   *
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The clickable row element
   * @protected
   */
  static async _onToggleItemDetails(event, target) {
    event.preventDefault();
    event.stopPropagation(); // Prevent any parent handlers

    const itemUuid = target.dataset.itemUuid;
    const itemRow = target.closest('.item-row');
    const detailsSection = itemRow.querySelector('.item-details');
    const expandIndicator = itemRow.querySelector('.expand-indicator');

    if (!detailsSection) return;

    // Toggle visibility
    const isExpanded = detailsSection.style.display !== 'none';
    detailsSection.style.display = isExpanded ? 'none' : 'block';

    // Toggle chevron direction
    if (expandIndicator) {
      expandIndicator.classList.toggle('expanded', !isExpanded);
    }

    // Toggle expanded class on row
    itemRow.classList.toggle('expanded', !isExpanded);
  }

  /**
   * Handle paragon selection change
   *
   * @param {Event} event   The originating change event
   * @protected
   */
  async _selectParagon(event) {
    event.preventDefault();
    event.stopPropagation();

    const selectedUuid = event.target.value;

    // If selecting the same paragon that's already selected, do nothing
    if (selectedUuid === this.actor.system.paragon.uuid) {
      return;
    }

    // If no paragon selected (blank option), clear the UUID and delete the paragon
    if (!selectedUuid) {
      const existingParagon = this.actor.items.find(i => i.type === 'paragon');
      if (existingParagon) {
        await existingParagon.delete();
      }
      await this.actor.update({ 'system.paragon.uuid': '' });
      ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.ParagonCleared"));
      return;
    }

    // Update the UUID reference first, so the UI updates immediately
    await this.actor.update({ 'system.paragon.uuid': selectedUuid });

    // Delete existing owned paragon item if it exists
    const existingParagon = this.actor.items.find(i => i.type === 'paragon');
    if (existingParagon) {
      await existingParagon.delete();
    }

    // Create embedded copy of selected paragon
    try {
      const paragonDoc = await fromUuid(selectedUuid);
      if (!paragonDoc) {
        ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonNotFound"));
        return;
      }

      await this.actor.createEmbeddedDocuments('Item', [paragonDoc.toObject()], {
        keepId: true
      });

      ui.notifications.info(game.i18n.format("DIE_RPG.Notifications.Success.ParagonSelected", {name: paragonDoc.name}));
    } catch (error) {
      console.error('DIE RPG | Error selecting paragon:', error);
      ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonSelectionFailed"));
    }
  }

  /** Helper Functions */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target    The element subject to search
   * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    // Check if the target has a document UUID directly (used by itemList fields)
    if (target.dataset.documentUuid) {
      const uuid = target.dataset.documentUuid;
      // Extract the document from the UUID
      // UUID format: Actor.{actorId}.Item.{itemId}
      const parts = uuid.split('.');
      if (parts.length >= 4 && parts[0] === 'Actor' && parts[2] === 'Item') {
        const itemId = parts[3];
        return this.actor.items.get(itemId);
      }
    }

    // Fallback to original implementation for gear list
    const docRow = target.closest('li[data-document-class]');
    if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === 'ActiveEffect') {
      const parent =
        docRow.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn('Could not find document class');
  }

  /***************
   *
   * Drag and Drop
   *
   ***************/

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (
        siblingId &&
        parentId &&
        (siblingId !== effect.id || parentId !== effect.parent.id)
      )
        siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = { _id: u.target.id, ...u.update };
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
      await this.actor.items
        .get(itemId)
        .updateEmbeddedDocuments('ActiveEffect', updates);
    }

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments('ActiveEffect', directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  /********************
   *
   * Actor Override Handling
   *
   ********************/

  /**
   * Submit a document update based on the processed form data.
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {object} submitData                   Processed and validated form data to be used for a document update
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  async _processSubmitData(event, form, submitData) {
    const overrides = foundry.utils.flattenObject(this.actor.overrides);
    for (let k of Object.keys(overrides)) delete submitData[k];
    await this.document.update(submitData);
  }

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) {
        input.disabled = true;
      }
    }
  }
}
