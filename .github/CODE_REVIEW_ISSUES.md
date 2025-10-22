# Code Review Issues - GitHub Issue Templates

Created from code review on 2025-10-21

Copy each section below into a new GitHub issue.

---

## CRITICAL PRIORITY

### Issue 1: Fix Error Handling in Paragon Selection

**Title:** Fix error handling in paragon selection to prevent silent failures

**Labels:** `bug`, `priority: high`, `actor-sheet`

**Description:**

When paragon selection fails in `_selectParagon`, the error is caught and logged but not properly handled, potentially leaving the actor in an inconsistent state.

**Location:**
`/module/sheets/actor-sheet.mjs:803-806`

**Current Code:**
```javascript
} catch (error) {
  console.error('DIE RPG | Error selecting paragon:', error);
  ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonSelectionFailed"));
  // Error is not re-thrown, function continues
}
```

**Problem:**
- Actor's paragon UUID may be updated but embedded item creation failed
- No state rollback on failure
- User sees error but data may be inconsistent

**Recommended Fix:**
```javascript
} catch (error) {
  console.error('DIE RPG | Error selecting paragon:', error);
  ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonSelectionFailed"));

  // Rollback to previous state
  await this.actor.update({
    'system.paragon.uuid': existingParagon?.uuid || ''
  });
  return;
}
```

**Acceptance Criteria:**
- [ ] Failed paragon selection restores previous state
- [ ] User receives clear error notification
- [ ] No orphaned data after failed operations
- [ ] Add unit test for error recovery

---

### Issue 2: Prevent Data Loss in JSON Parsing for Paragon Fields

**Title:** Add recovery mechanism for invalid JSON in paragon form fields

**Labels:** `bug`, `priority: high`, `item-sheet`, `data-integrity`

**Description:**

When users edit `classAbilities.fields` or `advancementForms.fields` with invalid JSON, the entire form submission is aborted with `throw error`, potentially losing all other valid changes.

**Location:**
`/module/sheets/item-sheet.mjs:1056-1059` and `1085-1087`

**Current Code:**
```javascript
} catch (error) {
  ui.notifications.error(game.i18n.format("DIE_RPG.Notifications.Error.InvalidClassAbilitiesJSON", {error: error.message}));
  throw error; // Aborts entire form save, loses all data
}
```

**Problem:**
- Valid changes to other fields are lost
- No opportunity to correct the JSON error
- Poor user experience during form editing

**Recommended Solutions:**

**Option 1: Pre-submission Validation**
- Validate JSON fields before form submission
- Show inline error messages
- Prevent submission until valid

**Option 2: Partial Save**
- Save valid fields even if JSON parsing fails
- Preserve the invalid JSON string for user to correct
- Show clear error message with the specific JSON error

**Option 3: JSON Editor UI**
- Replace textarea with a proper JSON editor component
- Real-time validation feedback
- Syntax highlighting

**Acceptance Criteria:**
- [ ] Users don't lose valid data when JSON is invalid
- [ ] Clear error messages indicate which field has invalid JSON
- [ ] Line number or specific error location provided
- [ ] Consider adding a "Validate JSON" button for pre-check

---

### Issue 3: Fix Race Condition in Paragon Selection Updates

**Title:** Refactor paragon selection to use atomic updates

**Labels:** `bug`, `priority: high`, `actor-sheet`, `data-integrity`

**Description:**

The `_selectParagon` method performs multiple sequential updates that could result in inconsistent state if any operation fails mid-sequence.

**Location:**
`/module/sheets/actor-sheet.mjs:759-806`

**Current Code:**
```javascript
// Update 1: Set UUID
await this.actor.update({ 'system.paragon.uuid': selectedUuid });

// Update 2: Delete old paragon
if (existingParagon) {
  await existingParagon.delete();
}

// Update 3: Create new paragon
await this.actor.createEmbeddedDocuments('Item', [paragonDoc.toObject()], {
  keepId: true
});
```

**Problem:**
- If step 2 or 3 fails, actor has UUID but wrong/no paragon item
- No rollback mechanism
- Multiple renders triggered
- Potential for race conditions if user clicks rapidly

**Recommended Fix:**

```javascript
async _selectParagon(event) {
  event.preventDefault();
  event.stopPropagation();

  const selectedUuid = event.target.value;
  const currentUuid = this.actor.system.paragon.uuid;

  if (selectedUuid === currentUuid) return;

  // Prepare all changes before applying
  const updates = [];
  const deletions = [];
  const creations = [];

  try {
    // Fetch new paragon first (fail fast)
    const paragonDoc = selectedUuid ? await fromUuid(selectedUuid) : null;

    if (selectedUuid && !paragonDoc) {
      throw new Error("Paragon not found");
    }

    const existingParagon = this.actor.items.find(i => i.type === 'paragon');

    // Build transaction
    if (existingParagon) {
      deletions.push(existingParagon.id);
    }

    if (paragonDoc) {
      creations.push(paragonDoc.toObject());
    }

    updates.push({ 'system.paragon.uuid': selectedUuid || '' });

    // Execute transaction
    if (deletions.length) {
      await this.actor.deleteEmbeddedDocuments('Item', deletions);
    }

    if (creations.length) {
      await this.actor.createEmbeddedDocuments('Item', creations, { keepId: true });
    }

    await this.actor.update(updates[0]);

    ui.notifications.info(
      paragonDoc
        ? game.i18n.format("DIE_RPG.Notifications.Success.ParagonSelected", {name: paragonDoc.name})
        : game.i18n.localize("DIE_RPG.Notifications.Success.ParagonCleared")
    );

  } catch (error) {
    console.error('DIE RPG | Error selecting paragon:', error);
    ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.ParagonSelectionFailed"));
    // Restore previous state
    await this.actor.update({ 'system.paragon.uuid': currentUuid });
  }
}
```

**Acceptance Criteria:**
- [ ] All changes applied atomically or all rolled back
- [ ] Single re-render after all changes
- [ ] Proper error recovery with state restoration
- [ ] User notification only after successful completion

---

## MODERATE PRIORITY

### Issue 4: Remove or Document Commented Code in Actor Class

**Title:** Clean up commented derived data calculations in Actor class

**Labels:** `tech-debt`, `priority: medium`, `documentation`

**Description:**

Large blocks of commented-out code for derived data calculations (Guard, Health, Willpower, Defense) exist without explanation.

**Location:**
`/module/documents/actor.mjs:30-65`

**Code:**
```javascript
// Calculate initial Guard value based on Dexterity
// resources.guard.value = stats.dex?.value ?? 0;

// Calculate initial Health based on Constitution
// resources.health.value = stats.con?.value ?? 0;

// Calculate Willpower based on Wisdom + Intelligence
// resources.willpower.value = (stats.wis?.value ?? 0) + (stats.int?.value ?? 0);

// Calculate Defense (Base 0 + Items/Effects)
// let defenseBonus = 0;
// ...
```

**Decision Needed:**

1. **If permanently removed:** Delete the code and document reason in commit message
2. **If temporarily disabled:** Add clear comment explaining:
   - Why it's disabled
   - When it should be re-enabled
   - Link to relevant issue/discussion
3. **If planned for future:** Create a separate issue and reference it

**Recommended Action:**
```javascript
/**
 * @override
 * Augment the actor source data with additional dynamic data.
 *
 * NOTE: Derived stat calculations (Guard, Health, Willpower, Defense) are
 * currently disabled because [REASON]. See issue #XXX for discussion.
 *
 * When re-enabled, these calculations will automatically derive:
 * - Guard from Dexterity
 * - Health from Constitution
 * - Willpower from Wisdom + Intelligence
 * - Defense from equipped items and active effects
 */
prepareDerivedData() {
  const actorData = this;
  const systemData = actorData.system;

  // Future: Re-enable derived calculations here
}
```

**Acceptance Criteria:**
- [ ] Either remove code or add clear documentation
- [ ] If keeping, create tracking issue and reference it
- [ ] Update any related documentation

---

### Issue 5: Implement Unified Logging Utility

**Title:** Create centralized logging utility to replace scattered console calls

**Labels:** `enhancement`, `priority: medium`, `developer-experience`

**Description:**

The codebase has inconsistent logging with mix of `console.log`, `console.warn`, `console.error`, and inconsistent prefixing.

**Current State:**
- 4 files contain console.* calls
- Some prefixed with `DIE RPG |`, others not
- No debug mode toggle
- Potential production logs

**Files Affected:**
- `/module/sheets/actor-sheet.mjs`
- `/module/helpers/dice.mjs`
- `/module/helpers/advancements.mjs`
- `/module/helpers/dice-interaction.mjs`

**Proposed Solution:**

Create `/module/helpers/logger.mjs`:
```javascript
/**
 * Centralized logging utility for DIE RPG system
 */

const LOG_PREFIX = 'DIE RPG';

export const logger = {
  /**
   * Log informational messages
   */
  info(message, ...args) {
    console.log(`${LOG_PREFIX} |`, message, ...args);
  },

  /**
   * Log warning messages
   */
  warn(message, ...args) {
    console.warn(`${LOG_PREFIX} |`, message, ...args);
  },

  /**
   * Log error messages
   */
  error(message, ...args) {
    console.error(`${LOG_PREFIX} |`, message, ...args);
  },

  /**
   * Log debug messages (only when debug mode enabled)
   */
  debug(message, ...args) {
    if (game.settings.get('die-rpg', 'debugMode')) {
      console.debug(`${LOG_PREFIX} | [DEBUG]`, message, ...args);
    }
  },

  /**
   * Create a scoped logger for a specific module
   */
  scope(moduleName) {
    return {
      info: (...args) => logger.info(`[${moduleName}]`, ...args),
      warn: (...args) => logger.warn(`[${moduleName}]`, ...args),
      error: (...args) => logger.error(`[${moduleName}]`, ...args),
      debug: (...args) => logger.debug(`[${moduleName}]`, ...args),
    };
  }
};
```

**Usage Example:**
```javascript
// In advancements.mjs
import { logger } from './logger.mjs';

const log = logger.scope('Advancements');

export async function getParagonItem(actor) {
  const paragonUuid = actor.system.paragon?.uuid;
  if (paragonUuid) {
    try {
      const item = await fromUuid(paragonUuid);
      if (item && item.type === 'paragon') {
        return item;
      }
    } catch (err) {
      log.warn(`Failed to load paragon item from UUID: ${paragonUuid}`, err);
    }
  }

  return actor.items.find(i => i.type === 'paragon') || null;
}
```

**Acceptance Criteria:**
- [ ] Create logger utility module
- [ ] Add `debugMode` setting to system settings
- [ ] Replace all console.* calls with logger
- [ ] Update at least one file as proof of concept
- [ ] Document usage in CONTRIBUTING.md

---

### Issue 6: Convert TODOs to Tracked Issues

**Title:** Create GitHub issues for all TODO comments in codebase

**Labels:** `tech-debt`, `priority: medium`, `project-management`

**Description:**

Found 5 TODO comments in the codebase that should be tracked as issues.

**TODOs Found:**

1. **`/module/helpers/dice.mjs:34`**
   ```javascript
   // TODO: Consider passing dataset.difficulty as initialDifficulty to dialog as well?
   ```
   - **Proposed Issue:** "Add initial difficulty parameter to roll dialog"
   - **Priority:** Low
   - **Labels:** `enhancement`, `dice-rolling`

2. **`/module/documents/actor.mjs:49`**
   ```javascript
   // TODO: Add check for equipped status if applicable
   ```
   - **Proposed Issue:** "Implement equipped/unequipped status for equipment"
   - **Priority:** Medium
   - **Labels:** `enhancement`, `equipment`

3. **`/module/data/item/equipment.mjs:48`**
   ```javascript
   // TODO: Could use StringField({ choices: [...] }) for validation
   ```
   - **Proposed Issue:** "Add choices validation to equipment type field"
   - **Priority:** Low
   - **Labels:** `enhancement`, `data-validation`

4. **`/module/data/actor/npc.mjs:16`**
   ```javascript
   // TODO: see if we want any of this from items
   ```
   - **Proposed Issue:** "Review NPC item aggregation requirements"
   - **Priority:** Low
   - **Labels:** `question`, `npc`

5. **`/module/data/actor/character.mjs:80`**
   ```javascript
   // TODO: add a template to persona.notes
   ```
   - **Proposed Issue:** "Add default template for persona notes"
   - **Priority:** Low
   - **Labels:** `enhancement`, `character-sheet`

**Action Items:**
- [ ] Create individual issues for each TODO
- [ ] Replace TODO comments with issue references:
  ```javascript
  // See issue #XXX: Add initial difficulty parameter to roll dialog
  ```
- [ ] Consider creating a "TODOs" project board for tracking

---

### Issue 7: Fix Typo in Handlebars Helper

**Title:** Fix typo: newVale → newValue in inc helper

**Labels:** `bug`, `priority: low`, `typo`

**Description:**

Simple typo in the `inc` Handlebars helper.

**Location:**
`/module/helpers/utils.mjs:68`

**Current Code:**
```javascript
Handlebars.registerHelper("inc", function(value, options) {
  const newVale = parseInt(value) + 1;  // Typo: "Vale" instead of "Value"
  return newVale;
});
```

**Fix:**
```javascript
Handlebars.registerHelper("inc", function(value, options) {
  const newValue = parseInt(value) + 1;
  return newValue;
});
```

**Acceptance Criteria:**
- [ ] Fix typo
- [ ] No functional changes
- [ ] Quick PR/commit

---

### Issue 8: Remove Duplicate Handlebars Helper Registration

**Title:** Remove duplicate toLowerCase helper registration

**Labels:** `tech-debt`, `priority: low`, `handlebars`

**Description:**

The `toLowerCase` Handlebars helper is registered twice:
1. In `/module/die-rpg.mjs:168`
2. In `/module/helpers/utils.mjs:33`

**Locations:**
```javascript
// die-rpg.mjs:168
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

// utils.mjs:33
Handlebars.registerHelper("toLowerCase", function (str) {
  return str?.toLowerCase() || str;
});
```

**Fix:**
Remove the registration in `die-rpg.mjs:168` since:
- `utils.mjs` handles all helper registration via `registerHandlebarsHelpers()`
- The utils.mjs version is safer with optional chaining and fallback
- Centralized registration is better for maintainability

**Acceptance Criteria:**
- [ ] Remove duplicate from die-rpg.mjs
- [ ] Verify no other duplicate helper registrations
- [ ] Test that helper still works after removal

---

### Issue 9: Add Input Validation to Action Handlers

**Title:** Add input validation to all sheet action handlers

**Labels:** `enhancement`, `priority: medium`, `robustness`

**Description:**

Many action handlers parse dataset values without validation, which could cause errors with malformed data.

**Examples:**

**1. `_deleteLook` - No bounds checking**
```javascript
// item-sheet.mjs:583
static async _deleteLook(event, target) {
  event.preventDefault();
  const index = parseInt(target.dataset.index); // No validation
  const looks = [...this.item.system.looks];
  looks.splice(index, 1); // Could fail if index out of bounds
  await this.item.update({ 'system.looks': looks });
}
```

**2. `_toggleAdvancement` - No null check**
```javascript
// actor-sheet.mjs:583
static async _toggleAdvancement(event, target) {
  event.preventDefault();
  const nodeId = target.dataset.nodeId; // Could be undefined
  // No validation before use
}
```

**Proposed Solution:**

Create validation helper:
```javascript
// module/helpers/validation.mjs
export function validateIndex(index, arrayLength, actionName = 'action') {
  const idx = parseInt(index);

  if (isNaN(idx)) {
    throw new Error(`Invalid index for ${actionName}: not a number`);
  }

  if (idx < 0 || idx >= arrayLength) {
    throw new Error(`Index out of bounds for ${actionName}: ${idx} (max: ${arrayLength - 1})`);
  }

  return idx;
}

export function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Required field missing: ${fieldName}`);
  }
  return value;
}
```

**Usage:**
```javascript
import { validateIndex, validateRequired } from '../helpers/validation.mjs';

static async _deleteLook(event, target) {
  event.preventDefault();

  try {
    const index = validateIndex(
      target.dataset.index,
      this.item.system.looks.length,
      'delete look'
    );

    const looks = [...this.item.system.looks];
    looks.splice(index, 1);
    await this.item.update({ 'system.looks': looks });
  } catch (error) {
    ui.notifications.warn(error.message);
    console.error('DIE RPG | Delete look failed:', error);
  }
}
```

**Files to Update:**
- `/module/sheets/item-sheet.mjs` - All array manipulation actions
- `/module/sheets/actor-sheet.mjs` - All actions using dataset values

**Acceptance Criteria:**
- [ ] Create validation helper module
- [ ] Add validation to all delete actions
- [ ] Add validation to toggle actions
- [ ] Add validation to create actions with dataset
- [ ] Handle validation errors gracefully with user notifications
- [ ] Add unit tests for validation helpers

---

## LOW PRIORITY / ENHANCEMENTS

### Issue 10: Extract Magic Numbers to Constants

**Title:** Replace magic numbers with named constants

**Labels:** `enhancement`, `priority: low`, `code-quality`

**Description:**

Several magic numbers throughout the codebase reduce readability.

**Examples:**

1. **Dice thresholds** (`/module/helpers/dice.mjs`)
   ```javascript
   // Line 62, 77, 82, 90, 94
   const successCount = diceResults.filter(r => r.result >= 4).length;
   const specialDice = diceResults.filter(r => r.active && r.result >= 6).length;
   const hasCritFailDie = diceResults.some(r => r.active && r.result === 1);
   ```

2. **Level constraints** (`/module/data/actor/character.mjs:18`)
   ```javascript
   schema.level = requiredInteger({ initial: 1, max: 20 });
   ```

**Proposed Constants:**

Update `/module/helpers/config.mjs`:
```javascript
export const DIE_RPG = {
  // ... existing config ...

  DICE: {
    SUCCESS_THRESHOLD: 4,
    SPECIAL_THRESHOLD: 6,
    CRITICAL_FAIL: 1,
  },

  CHARACTER: {
    MIN_LEVEL: 1,
    MAX_LEVEL: 20,
    DEFAULT_LEVEL: 1,
  },

  ADVANCEMENT: {
    TOTAL_NODES: 20,
    STARTING_NODE: 'row0-1',
  }
};
```

**Usage:**
```javascript
import { DIE_RPG } from './config.mjs';

// In dice.mjs
const successCount = diceResults.filter(r =>
  r.result >= DIE_RPG.DICE.SUCCESS_THRESHOLD
).length;

const specialDice = diceResults.filter(r =>
  r.active && r.result >= DIE_RPG.DICE.SPECIAL_THRESHOLD
).length;

const hasCritFailDie = diceResults.some(r =>
  r.active && r.result === DIE_RPG.DICE.CRITICAL_FAIL
);
```

**Acceptance Criteria:**
- [ ] Add constants to config.mjs
- [ ] Replace magic numbers in dice.mjs
- [ ] Replace magic numbers in character.mjs
- [ ] Update any localization strings that reference numbers
- [ ] Verify no behavioral changes

---

### Issue 11: Refactor Large Methods for Testability

**Title:** Break down large methods into smaller, testable functions

**Labels:** `refactor`, `priority: low`, `testing`

**Description:**

Several methods exceed 50 lines and handle multiple responsibilities, making them hard to test and maintain.

**Primary Target: `DieRpgActorSheet._prepareContext`**

**Location:** `/module/sheets/actor-sheet.mjs:159-234` (75 lines)

**Current Responsibilities:**
1. Building base context
2. Fetching paragon items
3. Fetching available paragons
4. Getting aggregated specials
5. Resolving equipment options
6. Enriching class ability data
7. Enriching advancement data
8. Preparing items
9. Enriching item descriptions

**Proposed Refactor:**
```javascript
async _prepareContext(options) {
  const context = this._buildBaseContext();
  await this._addParagonContext(context);
  await this._enrichDynamicFields(context);
  await this._enrichItemDescriptions(context);
  this._prepareItems(context);
  return context;
}

_buildBaseContext() {
  return {
    editable: this.isEditable,
    owner: this.isOwner,
    limited: this.document.limited,
    actor: this.actor,
    system: this.actor.system,
    flags: this.actor.flags,
    config: CONFIG.DIE_RPG,
    tabs: this._getTabs(options.parts),
    fields: this.document.schema.fields,
    systemFields: this.document.system.schema.fields,
  };
}

async _addParagonContext(context) {
  context.paragonItem = await getParagonItem(this.actor);
  context.paragons = await getParagons() || [];
  context.aggregatedSpecials = await getAggregatedSpecials(this.actor);

  // Resolve equipment options
  if (context.paragonItem?.system.equipmentOptions?.length) {
    const resolved = await Promise.all(
      context.paragonItem.system.equipmentOptions.map(uuid => fromUuid(uuid))
    );
    context.availableEquipment = resolved.filter(eq => eq);
  } else {
    context.availableEquipment = [];
  }
}

async _enrichDynamicFields(context) {
  if (!context.paragonItem) {
    context.enrichedClassAbilityData = {};
    context.enrichedAdvancementData = {};
    return;
  }

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

async _enrichItemDescriptions(context) {
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
}
```

**Benefits:**
- Each method has single responsibility
- Easier to unit test
- Better readability
- Easier to maintain
- Clear separation of concerns

**Acceptance Criteria:**
- [ ] Refactor `_prepareContext` into smaller methods
- [ ] Add JSDoc to each new method
- [ ] Verify no behavioral changes
- [ ] Add unit tests for new methods
- [ ] Consider refactoring other large methods

---

### Issue 12: Add Comprehensive JSDoc Documentation

**Title:** Improve JSDoc coverage for all public methods

**Labels:** `documentation`, `priority: low`, `developer-experience`

**Description:**

Many methods lack comprehensive JSDoc comments, making the codebase harder to understand and maintain.

**Current State:**
- Some functions have excellent JSDoc (e.g., `getAvailableSpecials`)
- Many action handlers have no documentation
- Missing parameter descriptions in many places
- No return type documentation in some functions

**Target Coverage:**
- [ ] All public methods in document classes
- [ ] All sheet action handlers
- [ ] All helper functions
- [ ] All data model schema definitions

**JSDoc Template:**
```javascript
/**
 * Brief description of what this method does
 *
 * Longer description if needed, explaining:
 * - When to use this method
 * - Important side effects
 * - Related methods
 *
 * @param {Type} paramName - Description of parameter
 * @param {Object} options - Options object
 * @param {boolean} [options.optional=false] - Description of optional parameter
 * @returns {Promise<Type>} Description of return value
 * @throws {Error} When this error occurs
 *
 * @example
 * const result = await someMethod(param, { optional: true });
 *
 * @see RelatedMethod
 * @since 2.0.0
 */
```

**Priority Files:**
1. `/module/sheets/actor-sheet.mjs` - All action handlers
2. `/module/sheets/item-sheet.mjs` - All action handlers
3. `/module/helpers/dice.mjs` - All public functions
4. `/module/helpers/advancements.mjs` - Already good, review for completeness

**Acceptance Criteria:**
- [ ] All public methods have JSDoc
- [ ] All parameters documented with types
- [ ] All return values documented
- [ ] Complex methods include @example
- [ ] Consider using TypeScript for type safety as alternative

---

### Issue 13: Add Testing Infrastructure

**Title:** Set up testing framework and add core tests

**Labels:** `testing`, `priority: medium`, `infrastructure`

**Description:**

The project currently has no automated tests, which makes refactoring risky and increases the chance of regressions.

**Proposed Setup:**

1. **Install Quench** (Foundry testing module)
   - Add to package.json as dev dependency
   - Configure in system.json

2. **Create Test Structure:**
   ```
   /module
     /tests
       /unit
         /helpers
           dice.test.mjs
           advancements.test.mjs
           specials.test.mjs
         /data
           character.test.mjs
           paragon.test.mjs
       /integration
         actor-sheet.test.mjs
         item-sheet.test.mjs
       setup.mjs
   ```

3. **Priority Test Coverage:**

**Critical Functions to Test:**
```javascript
// tests/unit/helpers/dice.test.mjs
describe('Dice Rolling', () => {
  describe('_rollDicePool', () => {
    it('should roll correct number of d6 for base pool');
    it('should add class die when requested');
    it('should handle advantages correctly');
    it('should handle disadvantages correctly');
    it('should handle zero/negative pool size');
  });

  describe('success counting', () => {
    it('should count results >= 4 as successes');
    it('should count results >= 6 as specials');
    it('should detect critical fails (0 successes + 1 rolled)');
    it('should apply difficulty correctly');
  });
});

// tests/unit/helpers/advancements.test.mjs
describe('Advancement System', () => {
  describe('canSelectNode', () => {
    it('should allow selecting reachable nodes');
    it('should block orphaned nodes');
    it('should respect level requirements');
    it('should validate prerequisites');
  });

  describe('getReachableNodes', () => {
    it('should find all nodes reachable from start');
    it('should include selected nodes');
    it('should handle disconnected graphs');
  });
});

// tests/unit/data/character.test.mjs
describe('Character Data Model', () => {
  it('should initialize with default values');
  it('should enforce level constraints (1-20)');
  it('should track flashback usage');
  it('should store paragon data correctly');
});
```

**Integration Tests:**
```javascript
// tests/integration/actor-sheet.test.mjs
describe('Actor Sheet', () => {
  describe('paragon selection', () => {
    it('should create paragon item when selected');
    it('should delete old paragon when changing');
    it('should rollback on error');
    it('should clear paragon when unselected');
  });

  describe('advancement tracking', () => {
    it('should toggle advancement selection');
    it('should remove orphaned nodes');
    it('should respect level limits');
  });
});
```

**Acceptance Criteria:**
- [ ] Set up Quench testing framework
- [ ] Create test structure
- [ ] Add tests for dice rolling logic (>80% coverage)
- [ ] Add tests for advancement validation
- [ ] Add tests for special aggregation
- [ ] Add integration tests for paragon selection
- [ ] Configure CI to run tests
- [ ] Document testing approach in CONTRIBUTING.md

---

### Issue 14: Performance: Optimize Equipment Resolution Caching

**Title:** Add caching for resolved equipment UUIDs

**Labels:** `performance`, `priority: low`, `optimization`

**Description:**

Equipment options are resolved from UUIDs on every render, which could be cached.

**Location:**
`/module/sheets/actor-sheet.mjs:189-193`

**Current Code:**
```javascript
const resolved = await Promise.all(
  context.paragonItem.system.equipmentOptions.map(uuid => fromUuid(uuid))
);
context.availableEquipment = resolved.filter(eq => eq);
```

**Issue:**
- `fromUuid` called every render
- Could cache resolved equipment
- Performance impact increases with more equipment options

**Proposed Solution:**

Add simple caching:
```javascript
// In actor-sheet.mjs
#equipmentCache = new Map();

async _resolveEquipment(uuids) {
  const resolved = [];
  const toFetch = [];

  // Check cache first
  for (const uuid of uuids) {
    if (this.#equipmentCache.has(uuid)) {
      resolved.push(this.#equipmentCache.get(uuid));
    } else {
      toFetch.push(uuid);
    }
  }

  // Fetch uncached items
  if (toFetch.length) {
    const fetched = await Promise.all(
      toFetch.map(uuid => fromUuid(uuid))
    );

    fetched.forEach((item, idx) => {
      if (item) {
        this.#equipmentCache.set(toFetch[idx], item);
        resolved.push(item);
      }
    });
  }

  return resolved;
}

// Clear cache when needed
async close(options) {
  this.#equipmentCache.clear();
  return super.close(options);
}
```

**Alternative:** Use Foundry's built-in UUID caching if available.

**Acceptance Criteria:**
- [ ] Implement equipment caching
- [ ] Measure performance improvement
- [ ] Clear cache on sheet close
- [ ] Invalidate cache when equipment changes
- [ ] Consider expanding to other UUID resolutions

---

## DOCUMENTATION

### Issue 15: Create Development Guidelines

**Title:** Add comprehensive development and contribution guidelines

**Labels:** `documentation`, `priority: medium`, `onboarding`

**Description:**

Create or enhance documentation to help contributors and future maintainers.

**Files to Create/Update:**

1. **`.github/CONTRIBUTING.md`** - Enhance existing with:
   - Code style guide
   - Commit message conventions
   - Branch naming conventions
   - PR process
   - Testing requirements

2. **`.github/PULL_REQUEST_TEMPLATE.md`** - Create:
   ```markdown
   ## Description
   <!-- Describe your changes -->

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Refactor
   - [ ] Documentation

   ## Testing
   - [ ] Manual testing completed
   - [ ] Unit tests added/updated
   - [ ] No console errors

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] JSDoc comments added
   - [ ] Localization strings added
   - [ ] CHANGELOG updated
   ```

3. **`docs/ARCHITECTURE.md`** - Create:
   - System overview
   - Data model explanations
   - Key concepts (paragons, advancements, specials)
   - Helper module purposes
   - Handlebars conventions

4. **`docs/TESTING.md`** - Create:
   - How to run tests
   - How to write tests
   - Testing philosophy
   - Coverage requirements

5. **`.github/ISSUE_TEMPLATE/`** - Create templates:
   - `bug_report.md`
   - `feature_request.md`
   - `question.md`

**Acceptance Criteria:**
- [ ] CONTRIBUTING.md enhanced
- [ ] PR template created
- [ ] Architecture documentation added
- [ ] Testing documentation added
- [ ] Issue templates created
- [ ] README updated with links to new docs

---

## Summary

**Total Issues Created: 15**

**By Priority:**
- 🔴 Critical (3): Issues #1-3
- 🟡 Moderate (6): Issues #4-9
- 🟢 Low/Enhancement (6): Issues #10-15

**By Category:**
- Bug Fixes: 5
- Tech Debt: 4
- Enhancement: 3
- Documentation: 2
- Testing: 1

**Estimated Effort:**
- Quick wins (< 1 hour): Issues #7, #8
- Small (1-4 hours): Issues #1, #2, #4, #6, #10
- Medium (1-2 days): Issues #3, #5, #9, #11, #12
- Large (1 week): Issues #13, #15
- Ongoing: Issue #14

---

**Next Steps:**
1. Review and prioritize these issues
2. Create labels in GitHub repository
3. Copy each issue into GitHub
4. Assign to milestones/projects as appropriate
5. Start with quick wins (#7, #8) for immediate improvement
