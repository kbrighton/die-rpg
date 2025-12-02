const { api, sheets, ux } = foundry.applications;
const DragDrop = foundry.applications.ux.DragDrop;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export class DieRpgItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['die-rpg', 'item'],
    position: {
      width: 800,
      height: 500,
    },
    window: {
      resizable: true,
    },
    actions: {
      onEditImage: this._onEditImage,
      browseImage: this._browseImage,
      viewDoc: this._viewEffect,
      createDoc: this._createEffect,
      deleteDoc: this._deleteEffect,
      toggleEffect: this._toggleEffect,
      addLook: this._addLook,
      deleteLook: this._deleteLook,
      addSpecial: this._addSpecial,
      deleteSpecial: this._deleteSpecial,
      addScripture: this._addScripture,
      deleteScripture: this._deleteScripture,
      addScriptureSpecial: this._addScriptureSpecial,
      deleteScriptureSpecial: this._deleteScriptureSpecial,
      addUpgrade: this._addUpgrade,
      deleteUpgrade: this._deleteUpgrade,
      addUpgradeSpecial: this._addUpgradeSpecial,
      deleteUpgradeSpecial: this._deleteUpgradeSpecial,
      removeEquipmentOption: this._removeEquipmentOption,
      toggleItemDetails: this._onToggleItemDetails,
    },
    form: {
      submitOnChange: true,
    },
    dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static TABS = {
    primary: {
      tabs: [
        { id: "description" },
        { id: "paragonDetails" },
        { id: "equipmentDetails" },
        { id: "lookDetails" },
        { id: "spellDetails" },
        { id: "godDetails" },
        { id: "giftDetails" },
        { id: "stanceDetails" },
        { id: "ventingDetails" },
        { id: "arcaneweaponDetails" },
        { id: "advancements" },
        { id: "looks" },
        { id: "eqParagonOptions" },
        { id: "abilities" },
        { id: "specials" },
      ],
      initial: "description",
      labelPrefix: "DIE_RPG.Item.Tabs",
    },
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    name: {
      template: 'systems/die-rpg/templates/item/name.hbs',
    },
    img: {
      template: 'systems/die-rpg/templates/item/img.hbs',
    },
    sidebar: {
      template: 'systems/die-rpg/templates/item/sidebar.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    // Tab sheets
    description: {
			template: "systems/die-rpg/templates/item/description.hbs",
      classes: ["scrollable"],
      scrollable: [""],
		},
    paragonDetails: {
      template: 'systems/die-rpg/templates/item/paragon/paragonDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    equipmentDetails: {
      template: 'systems/die-rpg/templates/item/equipmentDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    lookDetails: {
      template: 'systems/die-rpg/templates/item/lookDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    spellDetails: {
      template: 'systems/die-rpg/templates/item/spellDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    godDetails: {
      template: 'systems/die-rpg/templates/item/godDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    giftDetails: {
      template: 'systems/die-rpg/templates/item/giftDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    stanceDetails: {
      template: 'systems/die-rpg/templates/item/stanceDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    ventingDetails: {
      template: 'systems/die-rpg/templates/item/ventingDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    arcaneweaponDetails: {
      template: 'systems/die-rpg/templates/item/arcaneweaponDetails.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    advancements: {
      template: 'systems/die-rpg/templates/item/paragon/advancements.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    looks: {
      template: 'systems/die-rpg/templates/item/paragon/looks.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    eqParagonOptions: {
      template: 'systems/die-rpg/templates/item/paragon/equipment.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    abilities: {
      template: 'systems/die-rpg/templates/item/paragon/abilities.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
    specials: {
      template: 'systems/die-rpg/templates/item/specials.hbs',
      classes: ["scrollable"],
      scrollable: [""],
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    // Base parts for all items
    options.parts = ['name', 'img', 'tabs'];

    // Add the appropriate parts based on item type
    switch (this.document.type) {
      case 'paragon':
        options.parts.push('description', 'paragonDetails', 'advancements', 'looks', 'eqParagonOptions', 'abilities', 'specials');
        break;
      case 'equipment':
        options.parts.push('description', 'equipmentDetails', 'specials');
        break;
      case 'look':
        options.parts.push('description', 'lookDetails');
        break;
      case 'spell':
        options.parts.push('description', 'spellDetails', 'specials');
        break;
      case 'god':
        options.parts.push('description', 'godDetails');
        break;
      case 'gift':
        options.parts.push('description', 'giftDetails');
        break;
      case 'stance':
        options.parts.push('description', 'stanceDetails', 'specials');
        break;
      case 'venting':
        options.parts.push('description', 'ventingDetails');
        break;
      case 'arcaneweapon':
        options.parts.push('description', 'arcaneweaponDetails');
        break;
      default:
        options.parts.push('description', 'specials');
        break;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.DIE_RPG
      config: CONFIG.DIE_RPG,
      tabs: this._getTabs(options.parts), 
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
    };

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'eqParagonOptions':
        context.tab = context.tabs[partId];
        // Resolve equipment UUIDs for paragon items
        if (this.item.type === 'paragon' && this.item.system.equipmentOptions?.length) {
          const resolved = await Promise.all(
            this.item.system.equipmentOptions.map(uuid => fromUuid(uuid))
          );
          context.resolvedEquipment = resolved.filter(eq => eq); // Remove nulls

          // Enrich item descriptions for display in item-list partial
          context.enrichedItemDescriptions = {};
          for (const equipment of context.resolvedEquipment) {
            if (equipment.system.description) {
              context.enrichedItemDescriptions[equipment.id] = await ux.TextEditor.enrichHTML(
                equipment.system.description,
                {
                  relativeTo: equipment,
                  secrets: this.document.isOwner,
                  async: true
                }
              );
            }
          }
        } else {
          context.resolvedEquipment = [];
          context.enrichedItemDescriptions = {};
        }
        break;
      case 'advancements':
      case 'looks':
      case 'abilities':
      case 'equipmentDetails':
      case 'lookDetails':
      case 'spellDetails':
      case 'godDetails':
      case 'giftDetails':
      case 'stanceDetails':
      case 'ventingDetails':
      case 'arcaneweaponDetails':
        context.tab = context.tabs[partId];
        break;
      case 'specials':
        context.tab = context.tabs[partId];
        // Enrich all special descriptions for toggled ProseMirror editors
        context.enrichedSpecialDescriptions = [];
        if (this.item.system.specials?.length) {
          for (const special of this.item.system.specials) {
            const enriched = await ux.TextEditor.enrichHTML(
              special.description || '',
              {
                secrets: this.document.isOwner,
                rollData: this.item.getRollData(),
                relativeTo: this.item,
              }
            );
            context.enrichedSpecialDescriptions.push(enriched);
          }
        }
        break;
      case 'paragonDetails':
        context.tab = context.tabs[partId];
        context.enrichedCoreNature = await ux.TextEditor.enrichHTML(
          this.item.system.coreNature,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item,
          }
        );
        context.enrichedCoreAbilityDescription = await ux.TextEditor.enrichHTML(
          this.item.system.coreAbility.description,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item,
          }
        );
        break;
      case 'description':
        context.tab = context.tabs[partId];
        // Enrich description for the description tab
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedDescription = await ux.TextEditor.enrichHTML(
          this.item.system.description,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.item.getRollData(),
            // Relative UUID resolution
            relativeTo: this.item,
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
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'description';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'DIE_RPG.Item.Tabs.',
      };
      switch (partId) {
        case 'name':
        case 'img':
        case 'tabs':
        case 'sidebar':
          return tabs;
        case 'description':
          tab.id = 'description';
          tab.label += 'Description';
          break;
        case 'paragonDetails':
          tab.id = 'paragonDetails';
          tab.label += 'Details';
          break;
        case 'equipmentDetails':
          tab.id = 'equipmentDetails';
          tab.label += 'Details';
          break;
        case 'lookDetails':
          tab.id = 'lookDetails';
          tab.label += 'Details';
          break;
        case 'spellDetails':
          tab.id = 'spellDetails';
          tab.label += 'Details';
          break;
        case 'godDetails':
          tab.id = 'godDetails';
          tab.label += 'Details';
          break;
        case 'giftDetails':
          tab.id = 'giftDetails';
          tab.label += 'Details';
          break;
        case 'stanceDetails':
          tab.id = 'stanceDetails';
          tab.label += 'Details';
          break;
        case 'ventingDetails':
          tab.id = 'ventingDetails';
          tab.label += 'Details';
          break;
        case 'arcaneweaponDetails':
          tab.id = 'arcaneweaponDetails';
          tab.label += 'Details';
          break;
        case 'advancements':
          tab.id = 'advancements';
          tab.label += 'Advancements';
          break;
        case 'looks':
          tab.id = 'looks';
          tab.label += 'Looks';
          break;
        case 'eqParagonOptions':
          tab.id = 'eqParagonOptions';
          tab.label += 'EqParagonOptions';
          break;
        case 'abilities':
          tab.id = 'abilities';
          tab.label += 'abilities';
          break;
        case 'specials':
          tab.id = 'specials';
          tab.label += 'Specials';
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    new DragDrop.implementation({
      dragSelector: ".draggable",
      dropSelector: null,
      permissions: {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      },
      callbacks: {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      }
    }).bind(this.element);
    // You may want to add other special handling here
    // Foundry comes with a large number of utility classes, e.g. SearchFilter
    // That you may want to implement yourself.
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  /**
   * Handle changing a Document's image.
   *
   * @this DieRpgItemSheet
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
   * Handle opening a FilePicker to browse for an image for a specific field.
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @protected
   */
  static async _browseImage(event, target) {
    event.preventDefault();
    const fieldPath = target.dataset.target;
    const current = foundry.utils.getProperty(this.document, fieldPath);
    const fp = new FilePicker({
      current,
      type: 'image',
      callback: (path) => {
        this.document.update({ [fieldPath]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Add a new look to the paragon's looks array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _addLook(event, target) {
    event.preventDefault();
    const looks = this.item.system.looks || [];
    const newLook = { name: '', description: '', defenseBonus: 0 };
    await this.item.update({ 'system.looks': [...looks, newLook] });
  }

  /**
   * Delete a look from the paragon's looks array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _deleteLook(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index);
    const looks = [...this.item.system.looks];
    looks.splice(index, 1);
    await this.item.update({ 'system.looks': looks });
  }

  /**
   * Remove an equipment option from the paragon's equipment options array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _removeEquipmentOption(event, target) {
    event.preventDefault();
    const uuidToRemove = target.dataset.uuid;
    const options = [...(this.item.system.equipmentOptions || [])];
    const filtered = options.filter(uuid => uuid !== uuidToRemove);
    await this.item.update({ 'system.equipmentOptions': filtered });
    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.EquipmentOptionRemoved"));
  }

  /**
   * Toggle the visibility of item details in itemList fields
   * Expands/collapses a row to show item description and metadata
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The clickable row element
   * @protected
   */
  static async _onToggleItemDetails(event, target) {
    event.preventDefault();
    event.stopPropagation(); // Prevent any parent handlers

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
   * Add a new special to the paragon's specials array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _addSpecial(event, target) {
    event.preventDefault();
    const specials = this.item.system.specials || [];
    const newSpecial = {
      name: '',
      description: '',
      cost: 'special',
      mandatory: false,
      key: ''
    };
    await this.item.update({ 'system.specials': [...specials, newSpecial] });
  }

  /**
   * Delete a special from the paragon's specials array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _deleteSpecial(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index);
    const specials = [...this.item.system.specials];
    specials.splice(index, 1);
    await this.item.update({ 'system.specials': specials });
  }

  /**
   * Add a new scripture to the god's scriptures array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _addScripture(event, target) {
    event.preventDefault();
    const scriptures = this.item.system.scriptures || [];
    const newScripture = { name: '', description: '', specials: [] };
    await this.item.update({ 'system.scriptures': [...scriptures, newScripture] });
  }

  /**
   * Delete a scripture from the god's scriptures array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _deleteScripture(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index);
    const scriptures = [...this.item.system.scriptures];
    scriptures.splice(index, 1);
    await this.item.update({ 'system.scriptures': scriptures });
  }

  /**
   * Add a new special to a scripture's specials array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _addScriptureSpecial(event, target) {
    event.preventDefault();
    const scriptureIndex = parseInt(target.dataset.scriptureIndex);
    const scriptures = [...this.item.system.scriptures];
    const newSpecial = {
      name: game.i18n.localize("DIE_RPG.Actor.NPC.NewSpecial"),
      description: '',
      cost: 'special',
      mandatory: false,
    };
    scriptures[scriptureIndex].specials = [...(scriptures[scriptureIndex].specials || []), newSpecial];
    await this.item.update({ 'system.scriptures': scriptures });
  }

  /**
   * Delete a special from a scripture's specials array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _deleteScriptureSpecial(event, target) {
    event.preventDefault();
    const scriptureIndex = parseInt(target.dataset.scriptureIndex);
    const specialIndex = parseInt(target.dataset.specialIndex);
    const scriptures = [...this.item.system.scriptures];
    scriptures[scriptureIndex].specials.splice(specialIndex, 1);
    await this.item.update({ 'system.scriptures': scriptures });
  }

  /**
   * Add a new upgrade to the gift's upgrades array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _addUpgrade(event, target) {
    event.preventDefault();
    const upgrades = this.item.system.upgrades || [];
    const newUpgrade = { name: '', description: '', defenseBonus: 0, specials: [] };
    await this.item.update({ 'system.upgrades': [...upgrades, newUpgrade] });
  }

  /**
   * Delete an upgrade from the gift's upgrades array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _deleteUpgrade(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index);
    const upgrades = [...this.item.system.upgrades];
    upgrades.splice(index, 1);
    await this.item.update({ 'system.upgrades': upgrades });
  }

  /**
   * Add a new special to an upgrade's specials array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _addUpgradeSpecial(event, target) {
    event.preventDefault();
    const upgradeIndex = parseInt(target.dataset.upgradeIndex);
    const upgrades = [...this.item.system.upgrades];
    const newSpecial = {
      name: game.i18n.localize("DIE_RPG.Actor.NPC.NewSpecial"),
      description: '',
      cost: 'special',
      mandatory: false,
    };
    upgrades[upgradeIndex].specials = [...(upgrades[upgradeIndex].specials || []), newSpecial];
    await this.item.update({ 'system.upgrades': upgrades });
  }

  /**
   * Delete a special from an upgrade's specials array
   *
   * @this DieRpgItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _deleteUpgradeSpecial(event, target) {
    event.preventDefault();
    const upgradeIndex = parseInt(target.dataset.upgradeIndex);
    const specialIndex = parseInt(target.dataset.specialIndex);
    const upgrades = [...this.item.system.upgrades];
    upgrades[upgradeIndex].specials.splice(specialIndex, 1);
    await this.item.update({ 'system.upgrades': upgrades });
  }

  /** Helper Functions */

  /**
   *
   * DragDrop
   *
   */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) { }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = ux.TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call('dropItemSheetData', item, this, data);
    if (allowed === false) return;

    // Although you will find implmentations to all doc types here, it is important to keep 
    // in mind that only Active Effects are "valid" for items.
    // Actors have items, but items do not have actors.
    // Items in items is not implemented on Foudry per default. If you need an implementation with that,
    // try to search how other systems do. Basically they will use the drag and drop, but they will store
    // the UUID of the item.
    // Folders can only contain Actors or Items. So, fall on the cases above.
    // We left them here so you can have an idea of how that would work, if you want to do some kind of
    // implementation for that.
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.item.isOwner) return false;

    // Handle equipment drops on paragon items
    if (this.item.type === 'paragon') {
      const item = await Item.implementation.fromDropData(data);

      if (!item) {
        ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.InvalidItem"));
        return false;
      }

      // Only accept equipment items
      if (item.type !== 'equipment') {
        ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.OnlyEquipment"));
        return false;
      }

      const options = this.item.system.equipmentOptions || [];

      // Check for duplicates
      if (options.includes(item.uuid)) {
        ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.EquipmentAlreadyInList"));
        return false;
      }

      // Add to equipment options
      await this.item.update({
        'system.equipmentOptions': [...options, item.uuid]
      });

      ui.notifications.info(game.i18n.format("DIE_RPG.Notifications.Success.EquipmentOptionAdded", {name: item.name}));
      return true;
    }

    return false;
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
    if (!this.item.isOwner) return [];
  }

  /* -------------------------------------------- */

  /**
   * Process form data, parsing JSON textareas before expansion
   * @param {SubmitEvent} event             The form submission event
   * @param {HTMLFormElement} form          The form element
   * @param {FormDataExtended} formData     Processed form data
   * @returns {object}                      Expanded form data
   * @protected
   * @override
   */
  _processFormData(event, form, formData) {
    // For paragon items, parse JSON textareas BEFORE expanding the object
    if (this.document.type === 'paragon') {
      const rawData = formData.object;

      // Parse classAbilities.fields JSON textarea
      if ('system.classAbilities.fields' in rawData) {
        const value = rawData['system.classAbilities.fields'];

        if (typeof value === 'string') {
          if (value.trim() === '') {
            rawData['system.classAbilities.fields'] = [];
          } else {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                throw new Error('Expected an array');
              }
              for (let i = 0; i < parsed.length; i++) {
                const field = parsed[i];
                if (!field.key || !field.type || !field.label) {
                  throw new Error(`Field at index ${i} is missing required properties (key, type, label)`);
                }
              }
              rawData['system.classAbilities.fields'] = parsed;
            } catch (error) {
              // Show detailed error message with context
              const errorMsg = game.i18n.format(
                "DIE_RPG.Notifications.Error.InvalidClassAbilitiesJSON",
                { error: error.message }
              );
              const saveMsg = game.i18n.localize("DIE_RPG.Notifications.Info.PartialSaveOtherFieldsSaved");

              ui.notifications.error(`${errorMsg} ${saveMsg}`, { permanent: true });

              // Remove invalid field from update - keeps previous valid value
              // This allows other fields to save successfully (partial save)
              delete rawData['system.classAbilities.fields'];

              // Don't throw - continue processing other fields
            }
          }
        }
      }

      // Parse advancementForms.fields JSON textarea
      if ('system.advancementForms.fields' in rawData) {
        const value = rawData['system.advancementForms.fields'];

        if (typeof value === 'string') {
          if (value.trim() === '') {
            rawData['system.advancementForms.fields'] = [];
          } else {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                throw new Error('Expected an array');
              }
              for (let i = 0; i < parsed.length; i++) {
                const field = parsed[i];
                if (!field.key || !field.type || !field.label) {
                  throw new Error(`Field at index ${i} is missing required properties (key, type, label)`);
                }
              }
              rawData['system.advancementForms.fields'] = parsed;
            } catch (error) {
              // Show detailed error message with context
              const errorMsg = game.i18n.format(
                "DIE_RPG.Notifications.Error.InvalidAdvancementFormsJSON",
                { error: error.message }
              );
              const saveMsg = game.i18n.localize("DIE_RPG.Notifications.Info.PartialSaveOtherFieldsSaved");

              ui.notifications.error(`${errorMsg} ${saveMsg}`, { permanent: true });

              // Remove invalid field from update - keeps previous valid value
              // This allows other fields to save successfully (partial save)
              delete rawData['system.advancementForms.fields'];

              // Don't throw - continue processing other fields
            }
          }
        }
      }
    }

    return foundry.utils.expandObject(formData.object);
  }
}
