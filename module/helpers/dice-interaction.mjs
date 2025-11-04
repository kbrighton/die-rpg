/**
 * @class DiceInteraction
 * Handles visual styling and future interaction for dice shown in chat messages.
 *
 * This class:
 * 1. Applies CSS classes to dice based on their state (success, special, discarded, etc.)
 * 2. Provides hooks for rendering chat messages
 * 3. Stubs out future interactive features (crossing out dice, etc.)
 *
 * Based on the Eat the Reich dice allocation system but adapted for DIE RPG.
 */
export class DiceInteraction {
  /**
   * Handler for the 'renderChatMessage' hook. Applies styles to dice in a single message.
   * @param {ChatMessage} message - The ChatMessage document being rendered.
   * @param {HTMLElement} html - The HTMLElement object for the message's HTML.
   * @param {object} data - Additional data provided by the hook.
   */
  static onRenderChatMessage(message, htmlElement, data) {
    if (!htmlElement) return;

    // Check if this is a DIE RPG roll message
    const rollContainer = htmlElement.querySelector('.die-rpg-roll');
    if (!rollContainer) return;

    // Apply styles based on data attributes
    this._applyStylesFromAttributes(htmlElement);
  }

  /**
   * Handler for the 'renderChatLog' hook. Applies styles to all messages within the log.
   * @param {Application} app - The ChatLog application instance.
   * @param {HTMLElement} html - The HTMLElement for the chat log's outer HTML.
   * @param {object} data - Additional data provided by the hook.
   */
  static onRenderChatLog(app, htmlElement, data) {
    if (!htmlElement) return;

    htmlElement.querySelectorAll('.message').forEach((msgElement) => {
      const messageId = msgElement.dataset.messageId;
      if (!messageId) return;

      const message = game.messages.get(messageId);
      if (message) {
        // Check if this message contains DIE RPG roll data
        const rollContainer = msgElement.querySelector('.die-rpg-roll');
        if (rollContainer) {
          this._applyStylesFromAttributes(msgElement);
        }
      }
    });
  }

  /**
   * Apply CSS classes to dice elements within the provided HTML element based on their data attributes.
   * This function reads the state from the HTML attributes (result value, active state, etc.).
   *
   * @param {HTMLElement} htmlElement - The native HTMLElement for the container of dice elements.
   */
  static _applyStylesFromAttributes(htmlElement) {
    const diceElements = htmlElement.querySelectorAll('.roll.die');

    diceElements.forEach((dieElement) => {
      const dieValue = parseInt(dieElement.dataset.dieValue);
      const isActive = dieElement.dataset.isActive === 'true';

      // Apply appropriate classes based on die value and state
      if (!isNaN(dieValue)) {
        // Special dice (6+)
        if (dieValue >= 6) {
          dieElement.classList.add('special-die', 'success');
        }
        // Success dice (4-5)
        else if (dieValue >= 4) {
          dieElement.classList.add('success');
        }

        // Critical fail die (1)
        if (dieValue === 1) {
          dieElement.classList.add('critfail-die');
        }
      }

      // Apply discarded state
      if (!isActive) {
        dieElement.classList.add('discarded');
      }

      // Future: Apply crossed-out state from data attribute
      const isCrossedOut = dieElement.dataset.crossedOut === 'true';
      if (isCrossedOut) {
        dieElement.classList.add('crossed-out');
      }
    });
  }

  /**
   * Handle clicks on dice elements.
   *
   * When the 'enableDiceInteraction' setting is enabled, this will allow users to
   * click on dice to cross them out (representing scratching out successes equal to difficulty).
   *
   * @param {Event} event - The click event.
   */
  static async _handleDieClick(event) {
    const dieElement = event.currentTarget;
    event.preventDefault();

    // Check if dice interaction is enabled
    const interactionEnabled = game.settings.get('die-rpg', 'enableDiceInteraction');
    if (!interactionEnabled) {
      ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Info.DiceInteractionComingSoon"));
      return;
    }

    // Prevent action if the die is discarded
    if (dieElement.classList.contains('discarded')) return;

    const messageElement = dieElement.closest('.message');
    if (!messageElement) return;

    const messageId = messageElement.dataset.messageId;
    const message = game.messages.get(messageId);
    if (!message) {
      console.error('DIE RPG | Message not found for ID:', messageId);
      return;
    }

    // Check permissions
    if (!message.isOwner && !game.user.isGM) {
      ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.NoPermissionToModifyRoll"));
      return;
    }

    // Get die index and value
    const dieIndex = parseInt(dieElement.dataset.dieIndex);
    const dieValue = parseInt(dieElement.dataset.dieValue);

    // Only allow crossing out success dice (≥4)
    if (dieValue < 4) {
      ui.notifications.warn(game.i18n.localize("DIE_RPG.Notifications.Warning.CanOnlyCrossOutSuccessDice"));
      return;
    }

    // Get current roll data from message flags
    const rollData = message.flags['die-rpg'];
    if (!rollData) {
      console.error('DIE RPG | No roll data found in message flags');
      return;
    }

    // Toggle crossed-out state
    const crossedOutIndices = rollData.crossedOutIndices || [];
    const indexPosition = crossedOutIndices.indexOf(dieIndex);

    if (indexPosition > -1) {
      // Remove from crossed-out array
      crossedOutIndices.splice(indexPosition, 1);
    } else {
      // Add to crossed-out array
      crossedOutIndices.push(dieIndex);
    }

    // Recalculate final successes
    // NOTE: Crossed-out dice are VISUAL only - final successes still based on difficulty
    const { diceResults, difficulty, initialSuccesses } = rollData;
    const finalSuccesses = Math.max(0, initialSuccesses - difficulty);

    // Update template data with crossed-out state
    const updatedTemplateData = {
      ...rollData,
      diceResults: diceResults.map((die, idx) => ({
        ...die,
        crossedOut: crossedOutIndices.includes(idx)
      })),
      finalSuccesses: finalSuccesses,
      crossedOutIndices: crossedOutIndices
    };

    // Re-render the template
    const template = 'systems/die-rpg/templates/chat/roll-result.hbs';
    const renderFunc = foundry.applications?.handlebars?.renderTemplate || renderTemplate;
    const messageContent = await renderFunc(template, updatedTemplateData);

    // Update the message
    await message.update({
      content: messageContent,
      flags: {
        'die-rpg': {
          ...rollData,
          crossedOutIndices: crossedOutIndices
        }
      }
    });
  }
}
