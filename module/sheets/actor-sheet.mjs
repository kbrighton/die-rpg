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
      toggleFallenMode: this._toggleFallenMode,
      createItemForList: this._onCreateItemForList,
      toggleItemDetails: this._onToggleItemDetails,
      addEquipmentFromParagon: this._addEquipmentFromParagon,
      addAbility: this._addAbility,
      deleteAbility: this._deleteAbility,
      addMonstrousAbility: this._addMonstrousAbility,
      deleteMonstrousAbility: this._deleteMonstrousAbility,
      addSpecial: this._addSpecial,
      deleteSpecial: this._deleteSpecial,
      increment: this._onIncrement,
      decrement: this._onDecrement,
      cycleD6Face: this._cycleD6Face,
    },
    // dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    // Type-specific headers
    'character-header': {
      template: 'systems/die-rpg/templates/actor/character-header.hbs',
    },
    'npc-header': {
      template: 'systems/die-rpg/templates/actor/npc-header.hbs',
    },
    // Type-specific sidebars
    'character-sidebar': {
      template: 'systems/die-rpg/templates/actor/character-sidebar.hbs',
      scrollable: [""],
    },
    'npc-sidebar': {
      template: 'systems/die-rpg/templates/actor/npc-sidebar.hbs',
      scrollable: [""],
    },
    // Shared parts
    stats: {
      template: 'systems/die-rpg/templates/actor/stats.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    // Tab sheets - Character
    paragon: {
      template: 'systems/die-rpg/templates/actor/paragon.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    fallen: {
      template: 'systems/die-rpg/templates/actor/fallen.hbs',
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
    equipment: {
      template: 'systems/die-rpg/templates/actor/equipment.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    // Tab sheets - NPC
    'npc-details': {
      template: 'systems/die-rpg/templates/actor/npc-details.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    'npc-abilities': {
      template: 'systems/die-rpg/templates/actor/npc-abilities.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Don't show the other tabs if only limited view
    if (this.document.limited) {
      options.parts = ['character-header', 'character-sidebar', 'stats', 'tabs'];
      return;
    }
    // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'character':
        options.parts = ['character-header', 'character-sidebar', 'stats', 'tabs'];

        // Conditionally show Paragon and/or Fallen tabs based on fallenMode and game mode
        const gameMode = game.settings.get('die-rpg', 'fallenGameMode');
        const isFallen = this.document.system.fallenMode;

        if (isFallen) {
          if (gameMode === 'campaign') {
            // Campaign mode: Show both Paragon and Fallen tabs
            options.parts.push('paragon', 'fallen');
          } else {
            // Rituals mode: Only show Fallen tab (lose all paragon powers)
            options.parts.push('fallen');
          }
        } else {
          // Living character: Only show Paragon tab
          options.parts.push('paragon');
        }

        // Always show other tabs
        options.parts.push('advancements', 'equipment', 'persona', 'notes');
        break;
      case 'npc':
        // NPCs have no header - name is in sidebar
        options.parts = ['npc-sidebar', 'stats', 'tabs'];
        options.parts.push('npc-details', 'npc-abilities', 'equipment');
        break;
    }
  }

  /* -------------------------------------------- */

  /**
   * Get header controls for the application window
   * @returns {ApplicationHeaderControlsEntry[]} Array of control entries
   * @protected
   * @override
   */
  _getHeaderControls() {
    const controls = super._getHeaderControls();
    // Custom header buttons are now injected via _onFirstRender instead of dropdown
    return controls;
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
    const enrichOptions = {
      secrets: this.document.isOwner,
      rollData: this.actor.getRollData(),
      relativeTo: this.actor,
    };

    for (const field of fieldDefinitions) {
      // Enrich field description if present (store in separate property to avoid mutating source)
      if (field.description) {
        field.enrichedDescription = await ux.TextEditor.enrichHTML(field.description, enrichOptions);
      }

      if (field.type === 'html' || field.type === 'info') {
        // Use saved value, or fall back to field.initial
        const rawValue = fieldData?.[field.key] || field.initial || '';
        enriched[field.key] = await ux.TextEditor.enrichHTML(rawValue, enrichOptions);
      } else if (field.type === 'group' && field.fields) {
        // Recursively enrich nested group fields
        const groupData = fieldData?.[field.key] || {};
        enriched[field.key] = {};
        for (const subfield of field.fields) {
          // Enrich subfield description if present (store in separate property)
          if (subfield.description) {
            subfield.enrichedDescription = await ux.TextEditor.enrichHTML(subfield.description, enrichOptions);
          }

          if (subfield.type === 'html' || subfield.type === 'info') {
            // Use saved value, or fall back to subfield.initial
            const rawValue = groupData[subfield.key] || subfield.initial || '';
            enriched[field.key][subfield.key] = await ux.TextEditor.enrichHTML(rawValue, enrichOptions);
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

    // Resolve available equipment from paragon
    context.availableEquipment = [];
    if (context.paragonItem?.system.equipmentOptions?.length) {
      const resolved = await Promise.all(
        context.paragonItem.system.equipmentOptions.map(uuid => fromUuid(uuid))
      );
      context.availableEquipment = resolved.filter(eq => eq);
    }

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
      case 'fallen':
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
      case 'equipment':
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
      case 'npc-details':
        context.tab = context.tabs[partId];
        // Enrich NPC description
        context.enrichedDescription = await ux.TextEditor.enrichHTML(
          this.actor.system.description || '',
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
        // Enrich NPC notes
        context.enrichedNotes = await ux.TextEditor.enrichHTML(
          this.actor.system.notes || '',
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
        // Enrich NPC defence notes
        context.enrichedDefenceNotes = await ux.TextEditor.enrichHTML(
          this.actor.system.defenceNotes || '',
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
        break;
      case 'npc-abilities':
        context.tab = context.tabs[partId];
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
    // Default tab for first time it's rendered this session (set based on actor type)
    if (!this.tabGroups[tabGroup]) {
      this.tabGroups[tabGroup] = this.document.type === 'npc' ? 'npc-details' : 'paragon';
    }
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
        case 'character-header':
        case 'npc-header':
        case 'tabs':
        case 'sidebar':
        case 'character-sidebar':
        case 'npc-sidebar':
        case 'stats':
          return tabs;
        case 'paragon':
          tab.id = 'paragon';
          tab.label += 'Paragon';
          break;
        case 'fallen':
          tab.id = 'fallen';
          tab.label += 'Fallen';
          break;
        case 'advancements':
          tab.id = 'advancements';
          tab.label += 'Advancements';
          break;
        case 'equipment':
          tab.id = 'equipment';
          tab.label += 'Equipment';
          break;
        case 'persona':
          tab.id = 'persona';
          tab.label += 'Persona';
          break;
        case 'notes':
          tab.id = 'notes';
          tab.label += 'Notes';
          break;
        case 'npc-details':
          tab.id = 'npc-details';
          tab.label += 'NPCDetails';
          break;
        case 'npc-abilities':
          tab.id = 'npc-abilities';
          tab.label += 'NPCAbilities';
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
    // Initialize containers
    const equipment = [];

    // Iterate through items, allocating to containers
    for (let i of this.document.items) {
      // Append to equipment
      if (i.type === 'equipment') {
        equipment.push(i);
      }
    }

    // Sort then assign
    context.equipment = equipment.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  /**
   * Process form data to handle multi-select checkboxes and nested array updates
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

    // For NPC actors, deep merge nested abilities array updates to preserve all fields
    // This prevents losing ability.name when editing ability.specials[0].name
    // AND prevents losing sibling specials when editing one special
    if (this.document.type === 'npc' && expandedData.system?.abilities) {
      const currentAbilities = foundry.utils.deepClone(this.document.system.abilities || []);
      const updatedAbilities = expandedData.system.abilities;

      // Handle malformed empty-key specials (defensive fallback for template context issues)
      // If expandObject created {"": {specials: {...}}}, move it to ability 0
      if (updatedAbilities[""] && updatedAbilities[""].specials && currentAbilities.length > 0) {
        updatedAbilities[0] = updatedAbilities[0] || {};
        updatedAbilities[0].specials = updatedAbilities[""].specials;
        delete updatedAbilities[""];
      }

      expandedData.system.abilities = currentAbilities.map((ability, index) => {
        if (!updatedAbilities[index]) return ability;

        // Create a copy of the update without specials (to prevent mergeObject from corrupting the array)
        const updateWithoutSpecials = foundry.utils.deepClone(updatedAbilities[index]);
        delete updateWithoutSpecials.specials;

        // Merge ability-level fields (excluding specials)
        const merged = foundry.utils.mergeObject(ability, updateWithoutSpecials, {inplace: false});

        // Deep merge specials array if it exists in the update
        if (updatedAbilities[index].specials && ability.specials) {
          merged.specials = ability.specials.map((special, specIdx) => {
            if (updatedAbilities[index].specials[specIdx]) {
              return foundry.utils.mergeObject(special, updatedAbilities[index].specials[specIdx], {inplace: false});
            }
            return special;
          });
        }

        return merged;
      });
    }

    // For character actors, deep merge nested monstrousAbilities array updates
    // Same logic as NPC abilities above
    if (this.document.type === 'character' && expandedData.system?.monstrousAbilities) {
      const currentAbilities = foundry.utils.deepClone(this.document.system.monstrousAbilities || []);
      const updatedAbilities = expandedData.system.monstrousAbilities;

      // Handle malformed empty-key specials (defensive fallback for template context issues)
      if (updatedAbilities[""] && updatedAbilities[""].specials && currentAbilities.length > 0) {
        updatedAbilities[0] = updatedAbilities[0] || {};
        updatedAbilities[0].specials = updatedAbilities[""].specials;
        delete updatedAbilities[""];
      }

      expandedData.system.monstrousAbilities = currentAbilities.map((ability, index) => {
        if (!updatedAbilities[index]) return ability;

        // Create a copy of the update without specials
        const updateWithoutSpecials = foundry.utils.deepClone(updatedAbilities[index]);
        delete updateWithoutSpecials.specials;

        // Merge ability-level fields (excluding specials)
        const merged = foundry.utils.mergeObject(ability, updateWithoutSpecials, {inplace: false});

        // Deep merge specials array if it exists in the update
        if (updatedAbilities[index].specials && ability.specials) {
          merged.specials = ability.specials.map((special, specIdx) => {
            if (updatedAbilities[index].specials[specIdx]) {
              return foundry.utils.mergeObject(special, updatedAbilities[index].specials[specIdx], {inplace: false});
            }
            return special;
          });
        }

        return merged;
      });
    }

    return expandedData;
  }

  /**
   * Actions performed after the first render of the Application.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @override
   */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);

    // Only add custom header buttons for character sheets
    if (this.document.type !== 'character' || !this.isEditable) return;

    const header = this.element.querySelector(".window-header");
    const closeBtn = header.querySelector("[data-action=close]");

    // Create Flashback button
    this._flashbackBtn = document.createElement("button");
    this._flashbackBtn.type = "button";
    this._flashbackBtn.className = "header-control icon";
    this._flashbackBtn.innerHTML = '<i class="fa-solid fa-clock"></i>';
    this._flashbackBtn.addEventListener("click", (event) => {
      this.constructor._resetFlashback.call(this, event, this._flashbackBtn);
    });

    // Create Fallen Mode button
    this._fallenBtn = document.createElement("button");
    this._fallenBtn.type = "button";
    this._fallenBtn.className = "header-control icon";
    this._fallenBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    this._fallenBtn.addEventListener("click", (event) => {
      this.constructor._toggleFallenMode.call(this, event, this._fallenBtn);
    });

    // Insert buttons before close button
    closeBtn.parentElement.insertBefore(this._flashbackBtn, closeBtn);
    closeBtn.parentElement.insertBefore(this._fallenBtn, closeBtn);

    // Initialize button states
    this._updateHeaderButtons();
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

    // Update header button states after render
    this._updateHeaderButtons();
  }

  /**
   * Update custom header button states (icon and tooltip)
   * @protected
   */
  _updateHeaderButtons() {
    // Only update if buttons exist (character sheets only)
    if (!this._flashbackBtn || !this._fallenBtn) return;

    // Update Flashback button
    const flashbackUsed = this.actor.system.flashbackUsed;
    this._flashbackBtn.innerHTML = `<i class="fa-solid ${flashbackUsed ? 'fa-clock-rotate-left' : 'fa-clock'}"></i>`;
    this._flashbackBtn.title = game.i18n.localize(
      flashbackUsed
        ? "DIE_RPG.Actor.Character.ResetFlashback"
        : "DIE_RPG.Actor.Character.FlashbackAvailable"
    );

    // Update Fallen Mode button
    const fallenMode = this.actor.system.fallenMode;
    this._fallenBtn.innerHTML = `<i class="fa-solid ${fallenMode ? 'fa-skull' : 'fa-heart'}"></i>`;
    this._fallenBtn.title = game.i18n.localize(
      fallenMode
        ? "DIE_RPG.FallenMode.TooltipReturnToLiving"
        : "DIE_RPG.FallenMode.TooltipEnterFallen"
    );
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

    // If flashback is already available, show info message
    if (!this.actor.system.flashbackUsed) {
      ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Info.FlashbackAlreadyAvailable"));
      return;
    }

    // Reset flashback
    await this.actor.update({ 'system.flashbackUsed': false });
    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.FlashbackReset"));
    // Update header button states
    this._updateHeaderButtons();
  }

  /**
   * Handle toggling fallen mode on/off
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _toggleFallenMode(event, target) {
    event.preventDefault();
    const newState = !this.actor.system.fallenMode;
    await this.actor.update({ 'system.fallenMode': newState });

    const messageKey = newState
      ? "DIE_RPG.Notifications.Success.FallenModeEnabled"
      : "DIE_RPG.Notifications.Success.FallenModeDisabled";
    ui.notifications.info(game.i18n.localize(messageKey));

    // Re-render sheet (tabs change based on fallen mode)
    // Header buttons will update via _onRender -> _updateHeaderButtons
    this.render(false);
  }

  /**
   * Add a new monstrous ability to a character's monstrousAbilities array
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element
   * @protected
   */
  static async _addMonstrousAbility(event, target) {
    event.preventDefault();

    const abilities = this.actor.system.monstrousAbilities || [];
    const newAbility = {
      name: game.i18n.localize("DIE_RPG.FallenMode.MonstrousAbilities.NewAbility"),
      description: '',
      customization: '',
      specials: [],
    };

    await this.actor.update({
      'system.monstrousAbilities': [...abilities, newAbility]
    });

    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.MonstrousAbilityAdded"));
  }

  /**
   * Delete a monstrous ability from a character's monstrousAbilities array
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element
   * @protected
   */
  static async _deleteMonstrousAbility(event, target) {
    event.preventDefault();

    const abilityIndex = parseInt(target.dataset.abilityIndex);
    if (isNaN(abilityIndex)) {
      console.warn('DIE RPG | Invalid monstrous ability index for deletion');
      return;
    }

    const abilities = [...this.actor.system.monstrousAbilities];
    abilities.splice(abilityIndex, 1);

    await this.actor.update({
      'system.monstrousAbilities': abilities
    });

    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.MonstrousAbilityDeleted"));
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
   * Add equipment from paragon options to actor's inventory
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element
   * @protected
   */
  static async _addEquipmentFromParagon(event, target) {
    event.preventDefault();

    const select = this.element.querySelector('#equipment-select');
    const selectedUuid = select?.value;

    if (!selectedUuid) {
      ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.SelectEquipment"));
      return;
    }

    // Fetch the equipment document
    const equipment = await fromUuid(selectedUuid);
    if (!equipment) {
      ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.EquipmentNotFound"));
      return;
    }

    // Create owned copy using standard item creation
    await this.actor.createEmbeddedDocuments('Item', [equipment.toObject()]);

    // Reset dropdown
    select.value = "";

    ui.notifications.info(game.i18n.format("DIE_RPG.Notifications.Success.EquipmentAddedToInventory", {name: equipment.name}));
  }

  /**
   * Add a new ability to an NPC's abilities array
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element
   * @protected
   */
  static async _addAbility(event, target) {
    event.preventDefault();

    const abilities = this.actor.system.abilities || [];
    const newAbility = {
      name: game.i18n.localize("DIE_RPG.Actor.NPC.NewAbility"),
      description: '',
      specials: [],
    };

    await this.actor.update({
      'system.abilities': [...abilities, newAbility]
    });

    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.AbilityAdded"));
  }

  /**
   * Delete an ability from an NPC's abilities array
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element
   * @protected
   */
  static async _deleteAbility(event, target) {
    event.preventDefault();

    const abilityIndex = parseInt(target.dataset.abilityIndex);
    if (isNaN(abilityIndex)) {
      console.warn('DIE RPG | Invalid ability index for deletion');
      return;
    }

    const abilities = [...this.actor.system.abilities];
    abilities.splice(abilityIndex, 1);

    await this.actor.update({
      'system.abilities': abilities
    });

    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.AbilityDeleted"));
  }

  /**
   * Add a special to an NPC ability
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element
   * @protected
   */
  static async _addSpecial(event, target) {
    event.preventDefault();

    const abilityIndex = parseInt(target.dataset.abilityIndex);
    if (isNaN(abilityIndex)) {
      console.warn('DIE RPG | Invalid ability index for adding special');
      return;
    }

    const abilities = foundry.utils.deepClone(this.actor.system.abilities);
    const ability = abilities[abilityIndex];

    if (!ability) {
      console.warn('DIE RPG | Ability not found at index', abilityIndex);
      return;
    }

    const newSpecial = {
      name: game.i18n.localize("DIE_RPG.Actor.NPC.NewSpecial"),
      description: '',
      cost: 'special',
      mandatory: false,
    };

    if (!ability.specials) {
      ability.specials = [];
    }
    ability.specials.push(newSpecial);

    await this.actor.update({
      'system.abilities': abilities
    });

    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.SpecialAdded"));
  }

  /**
   * Delete a special from an NPC ability
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The button element
   * @protected
   */
  static async _deleteSpecial(event, target) {
    event.preventDefault();

    const abilityIndex = parseInt(target.dataset.abilityIndex);
    const specialIndex = parseInt(target.dataset.specialIndex);

    if (isNaN(abilityIndex) || isNaN(specialIndex)) {
      console.warn('DIE RPG | Invalid indices for special deletion');
      return;
    }

    const abilities = foundry.utils.deepClone(this.actor.system.abilities);
    const ability = abilities[abilityIndex];

    if (!ability || !ability.specials || !ability.specials[specialIndex]) {
      console.warn('DIE RPG | Special not found at indices', abilityIndex, specialIndex);
      return;
    }

    ability.specials.splice(specialIndex, 1);

    await this.actor.update({
      'system.abilities': abilities
    });

    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.SpecialDeleted"));
  }

  /**
   * Handle increment button click for number spinner
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _onIncrement(event, target) {
    event.preventDefault();
    const name = target.dataset.name;
    const input = this.element.querySelector(`input[name="${name}"]`);
    if (!input) return;

    const max = target.dataset.max ? parseInt(target.dataset.max) : Infinity;
    let value = parseInt(input.value) || 0;
    value = Math.min(max, value + 1);
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Handle decrement button click for number spinner
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _onDecrement(event, target) {
    event.preventDefault();
    const name = target.dataset.name;
    const input = this.element.querySelector(`input[name="${name}"]`);
    if (!input) return;

    const min = target.dataset.min ? parseInt(target.dataset.min) : 0;
    let value = parseInt(input.value) || 0;
    value = Math.max(min, value - 1);
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Handle cycling D6 face state for the Fool's flukes widget
   * Cycles: empty → circle → cross → empty
   *
   * @this DieRpgActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _cycleD6Face(event, target) {
    event.preventDefault();

    const path = target.dataset.path;
    const faceId = target.dataset.face;

    if (!path || !faceId) {
      console.warn('DIE RPG | Invalid D6 face data attributes');
      return;
    }

    // Get current face data object
    const currentData = foundry.utils.getProperty(this.actor, path) || {};
    const currentState = currentData[faceId] || '';

    // Cycle: empty → circle → cross → empty
    const nextState = {
      '': 'circle',
      'circle': 'cross',
      'cross': ''
    }[currentState] || '';

    // Create updated data object
    const updateData = { ...currentData, [faceId]: nextState };

    // Update the actor
    await this.actor.update({ [path]: updateData });
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
    const currentUuid = this.actor.system.paragon.uuid;

    // If selecting the same paragon that's already selected, do nothing
    if (selectedUuid === currentUuid) {
      return;
    }

    // If no paragon selected (blank option), clear the UUID and delete the paragon
    if (!selectedUuid) {
      try {
        const existingParagon = this.actor.items.find(i => i.type === 'paragon');
        if (existingParagon) {
          await existingParagon.delete();
        }
        await this.actor.update({ 'system.paragon.uuid': '' });
        ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.ParagonCleared"));
      } catch (error) {
        console.error('DIE RPG | Error clearing paragon:', error);
        ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonClearFailed"));
        // Restore previous state
        await this.actor.update({ 'system.paragon.uuid': currentUuid });
      }
      return;
    }

    // Store reference to existing paragon before making changes
    const existingParagon = this.actor.items.find(i => i.type === 'paragon');

    try {
      // Fetch and validate new paragon FIRST (fail fast before making any changes)
      const paragonDoc = await fromUuid(selectedUuid);
      if (!paragonDoc) {
        ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonNotFound"));
        return;
      }

      // Update the UUID reference
      await this.actor.update({ 'system.paragon.uuid': selectedUuid });

      // Delete existing owned paragon item if it exists
      if (existingParagon) {
        await existingParagon.delete();
      }

      // Create embedded copy of selected paragon
      await this.actor.createEmbeddedDocuments('Item', [paragonDoc.toObject()], {
        keepId: true
      });

      // Update actor images from paragon defaults (only if actor images are still default)
      const updates = {};
      const DEFAULT_IMG = 'icons/svg/mystery-man.svg';

      // Portrait image - update actor.img if it's still default and paragon has a portraitImage
      if (paragonDoc.system.portraitImage && this.actor.img === DEFAULT_IMG) {
        updates.img = paragonDoc.system.portraitImage;
      }

      // Token image - two cases:
      // 1. If paragon has explicit tokenImage, use it (if token is still default)
      // 2. Otherwise, let Foundry auto-sync actor.img to token (default behavior)
      if (paragonDoc.system.tokenImage) {
        const currentTokenSrc = this.actor.prototypeToken.texture.src;
        if (!currentTokenSrc || currentTokenSrc === DEFAULT_IMG) {
          updates['prototypeToken.texture.src'] = paragonDoc.system.tokenImage;
        }
      }

      if (Object.keys(updates).length > 0) {
        await this.actor.update(updates);
      }

      ui.notifications.info(game.i18n.format("DIE_RPG.Notifications.Success.ParagonSelected", {name: paragonDoc.name}));
    } catch (error) {
      console.error('DIE RPG | Error selecting paragon:', error);
      ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonSelectionFailed"));

      // Rollback: Restore previous UUID
      try {
        await this.actor.update({ 'system.paragon.uuid': currentUuid });

        // If we deleted the old paragon but failed to create the new one, try to restore it
        if (existingParagon && !this.actor.items.find(i => i.type === 'paragon')) {
          await this.actor.createEmbeddedDocuments('Item', [existingParagon.toObject()], {
            keepId: true
          });
        }
      } catch (rollbackError) {
        console.error('DIE RPG | Critical: Failed to rollback paragon selection:', rollbackError);
        ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonRollbackFailed"));
      }
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
