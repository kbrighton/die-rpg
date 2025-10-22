# Feature Specification: CodeMirror JSON Editor Integration

**Status:** Proposed
**Priority:** Low (Enhancement)
**Estimated Effort:** 6-8 hours
**Dependencies:** Issue #2 (Partial Save) must be implemented first
**Related Issues:** Issue #2

---

## Overview

Replace plain textarea JSON inputs with CodeMirror 6 editors to provide syntax highlighting, real-time validation, and better user experience when editing paragon `classAbilities.fields` and `advancementForms.fields`.

---

## Requirements

### Functional Requirements

1. **FR-1: Syntax Highlighting**
   - JSON keys displayed in one color
   - JSON values (strings, numbers, booleans) in distinct colors
   - Bracket matching and highlighting
   - Line numbers displayed

2. **FR-2: Real-time Validation**
   - Inline error indicators for syntax errors
   - Error tooltips on hover
   - Validation status indicator (valid/invalid)
   - No form submission blocking (uses partial save)

3. **FR-3: Enhanced Editing**
   - Auto-indent and bracket matching
   - Bracket auto-closing
   - Multi-cursor support
   - Search and replace (Ctrl+F)
   - Undo/redo history

4. **FR-4: Utility Functions**
   - "Validate JSON" button with detailed error reporting
   - "Format JSON" button to prettify/minify
   - Copy formatted JSON to clipboard

5. **FR-5: Form Integration**
   - Seamless integration with Foundry's form submission
   - Values sync to hidden textarea for compatibility
   - Works with submitOnChange: true
   - Cleanup on sheet close

### Non-Functional Requirements

1. **NFR-1: Offline Support (CRITICAL)**
   - Must work without internet connection
   - All assets bundled with system
   - No CDN dependencies

2. **NFR-2: Performance**
   - Initial load < 100ms for editor initialization
   - Bundle size < 100KB (gzipped)
   - No noticeable lag with documents up to 10,000 lines

3. **NFR-3: Accessibility**
   - Keyboard navigation (Tab, Shift+Tab, arrows)
   - Screen reader compatible
   - ARIA labels for controls
   - High contrast mode support

4. **NFR-4: Browser Compatibility**
   - Chrome 90+
   - Firefox 88+
   - Edge 90+
   - Safari 14+
   - Match Foundry v13 browser requirements

5. **NFR-5: Maintainability**
   - Clear separation of concerns
   - Easy to disable/enable per field
   - Documented API for future extensions
   - TypeScript definitions (optional)

---

## Technical Architecture

### Library Selection: CodeMirror 6

**Rationale:**
- ✅ Lightweight (50-60KB gzipped)
- ✅ Modern, actively maintained (2024+)
- ✅ Excellent JSON support via `@codemirror/lang-json`
- ✅ No framework dependencies (vanilla JS)
- ✅ MIT license
- ✅ Tree-shakeable (only bundle what we use)
- ✅ Accessibility built-in
- ✅ Mobile-friendly

**Package Dependencies:**
```json
{
  "@codemirror/state": "^6.4.1",
  "@codemirror/view": "^6.26.0",
  "@codemirror/lang-json": "^6.0.1",
  "@codemirror/commands": "^6.3.3",
  "@codemirror/autocomplete": "^6.15.0",
  "@codemirror/lint": "^6.5.0",
  "@codemirror/search": "^6.5.6"
}
```

**Total Size:** ~55KB gzipped (with all features)

---

## Implementation Plan

### Phase 1: Build Infrastructure Setup

#### 1.1: Install Bundler

**Tool:** Rollup (chosen for tree-shaking and ES module support)

**Install:**
```bash
npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-terser
```

**Why Rollup:**
- ✅ Best ES module bundler
- ✅ Tree-shaking eliminates unused code
- ✅ Smaller output than webpack
- ✅ Native ESM support
- ✅ Used by many Foundry modules

**Alternatives Considered:**
- ❌ Webpack - Too heavy, poor tree-shaking
- ❌ esbuild - Faster but less mature plugin ecosystem
- ⚠️ Vite - Great but overkill for this use case

#### 1.2: Create Rollup Configuration

**File:** `rollup.config.mjs`

```javascript
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'module/lib/json-editor-bundle.mjs',
  output: {
    file: 'module/lib/json-editor.min.mjs',
    format: 'es',
    sourcemap: true,
    name: 'JSONEditor'
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    terser({
      compress: {
        drop_console: false, // Keep console for debugging
        passes: 2
      },
      mangle: {
        reserved: ['EditorView', 'EditorState'] // Don't mangle public API
      }
    })
  ],
  external: [] // Bundle everything (for offline support)
};
```

#### 1.3: Create Bundle Entry Point

**File:** `module/lib/json-editor-bundle.mjs`

```javascript
/**
 * CodeMirror 6 bundle for DIE RPG JSON editing
 *
 * This file is the entry point for bundling CodeMirror.
 * It re-exports only the parts we need to keep bundle size small.
 *
 * Bundle output: module/lib/json-editor.min.mjs (~55KB gzipped)
 */

// Core editor
export {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  highlightSelectionMatches
} from '@codemirror/view';

export {
  EditorState,
  Compartment
} from '@codemirror/state';

// JSON language support
export {
  json,
  jsonLanguage,
  jsonParseLinter
} from '@codemirror/lang-json';

// Linting (validation)
export {
  linter,
  lintGutter,
  lintKeymap
} from '@codemirror/lint';

// Commands (undo, redo, etc.)
export {
  defaultKeymap,
  historyKeymap,
  history,
  undo,
  redo
} from '@codemirror/commands';

// Search
export {
  search,
  searchKeymap,
  highlightSelectionMatches as searchHighlight
} from '@codemirror/search';

// Autocomplete
export {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete';
```

**Why this approach:**
- Only bundles what we actually use
- Single import point for consuming code
- Tree-shaking reduces final bundle size
- Easy to add/remove features later

#### 1.4: Update Build Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "build": "npm run build:css && npm run build:js",
    "build:css": "sass src/scss/die-rpg.scss css/die-rpg.css --style=expanded --no-source-map",
    "build:js": "rollup -c",
    "watch": "concurrently \"npm run watch:css\" \"npm run watch:js\"",
    "watch:css": "sass src/scss/die-rpg.scss css/die-rpg.css --style=expanded --source-map --watch",
    "watch:js": "rollup -c --watch",
    "pushLDBtoJSON": "node ./tools/pushLDBtoJSON.mjs",
    "pullJSONtoLDB": "node ./tools/pullJSONtoLDB.mjs",
    "createSymlinks": "node ./tools/create-symlinks.mjs"
  },
  "devDependencies": {
    "@foundryvtt/foundryvtt-cli": "^1.0.3",
    "sass": "^1.53.0",
    "js-yaml": "^4.1.0",
    "rollup": "^4.18.0",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-terser": "^0.4.4",
    "concurrently": "^8.2.2",
    "@codemirror/state": "^6.4.1",
    "@codemirror/view": "^6.26.0",
    "@codemirror/lang-json": "^6.0.1",
    "@codemirror/commands": "^6.3.3",
    "@codemirror/autocomplete": "^6.15.0",
    "@codemirror/lint": "^6.5.0",
    "@codemirror/search": "^6.5.6"
  }
}
```

**Note:** Added `concurrently` to run CSS and JS watchers in parallel.

#### 1.5: Update .gitignore

**File:** `.gitignore` (add these lines)

```gitignore
# CodeMirror bundle output
/module/lib/json-editor.min.mjs
/module/lib/json-editor.min.mjs.map

# Node modules
/node_modules/
```

**Why:**
- Bundle is generated, shouldn't be in git
- Developers run `npm run build` to generate
- Source maps useful for development debugging

---

### Phase 2: CodeMirror Wrapper Module

#### 2.1: Create Editor Initialization Module

**File:** `module/helpers/json-editor.mjs`

```javascript
/**
 * CodeMirror JSON Editor wrapper for DIE RPG
 *
 * Provides a simple API to convert textareas into CodeMirror JSON editors
 * with validation, formatting, and Foundry form integration.
 *
 * @module helpers/json-editor
 */

import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  rectangularSelection,
  highlightActiveLine
} from '../lib/json-editor.min.mjs';

import {
  EditorState,
  Compartment
} from '../lib/json-editor.min.mjs';

import {
  json,
  jsonParseLinter
} from '../lib/json-editor.min.mjs';

import {
  linter,
  lintGutter
} from '../lib/json-editor.min.mjs';

import {
  defaultKeymap,
  historyKeymap,
  history
} from '../lib/json-editor.min.mjs';

import {
  search,
  searchKeymap
} from '../lib/json-editor.min.mjs';

import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '../lib/json-editor.min.mjs';

/**
 * Default theme for DIE RPG JSON editors
 */
const dieRpgTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    backgroundColor: 'var(--color-bg-input)',
    color: 'var(--color-text-dark-primary)'
  },
  '.cm-content': {
    caretColor: 'var(--color-text-dark-primary)',
    padding: '8px 0'
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-bg-option)',
    color: 'var(--color-text-dark-5)',
    border: 'none',
    borderRight: '1px solid var(--color-border-dark)'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--color-bg-option-active)'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  '.cm-selectionBackground': {
    backgroundColor: 'var(--color-focus-outline) !important'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--color-focus-outline) !important'
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--color-text-dark-primary)'
  }
}, { dark: true });

/**
 * JSON syntax highlighting theme
 */
const jsonHighlightTheme = EditorView.theme({
  '.cm-string': { color: '#98c379' },      // Green
  '.cm-number': { color: '#d19a66' },      // Orange
  '.cm-bool': { color: '#56b6c2' },        // Cyan
  '.cm-null': { color: '#c678dd' },        // Purple
  '.cm-property': { color: '#e06c75' },    // Red
  '.cm-punctuation': { color: '#abb2bf' }  // Light gray
}, { dark: true });

/**
 * Configuration compartment for dynamic updates
 */
const readOnlyCompartment = new Compartment();

/**
 * Initialize CodeMirror JSON editor on a textarea
 *
 * @param {HTMLTextAreaElement} textarea - The textarea element to enhance
 * @param {object} [options={}] - Configuration options
 * @param {Function} [options.onChange] - Callback when content changes
 * @param {boolean} [options.readOnly=false] - Make editor read-only
 * @param {string} [options.placeholder=''] - Placeholder text
 * @param {number} [options.minHeight=200] - Minimum height in pixels
 * @param {number} [options.maxHeight=600] - Maximum height in pixels
 * @returns {EditorView} The CodeMirror editor instance
 *
 * @example
 * const editor = initializeJSONEditor(document.querySelector('textarea.json-editor'), {
 *   onChange: (value) => console.log('Changed:', value),
 *   minHeight: 300
 * });
 */
export function initializeJSONEditor(textarea, options = {}) {
  const {
    onChange = null,
    readOnly = false,
    placeholder = '',
    minHeight = 200,
    maxHeight = 600
  } = options;

  // Don't initialize if already initialized
  if (textarea._cmEditor) {
    console.warn('DIE RPG | JSON Editor already initialized on this textarea');
    return textarea._cmEditor;
  }

  // Create extensions array
  const extensions = [
    // Basic setup
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    rectangularSelection(),
    highlightActiveLine(),

    // JSON language
    json(),

    // Linting
    linter(jsonParseLinter()),
    lintGutter(),

    // Bracket handling
    closeBrackets(),

    // Autocomplete
    autocompletion(),

    // Search
    search(),

    // Keymaps
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...completionKeymap,
      ...closeBracketsKeymap
    ]),

    // Themes
    dieRpgTheme,
    jsonHighlightTheme,

    // Read-only compartment (can be toggled)
    readOnlyCompartment.of(EditorView.editable.of(!readOnly)),

    // Height constraints
    EditorView.theme({
      '&': {
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`
      },
      '.cm-scroller': {
        overflow: 'auto'
      }
    }),

    // Change listener
    EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        onChange(update.state.doc.toString());
      }
    })
  ];

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.className = 'codemirror-json-editor';
  wrapper.setAttribute('data-editor-for', textarea.name);
  textarea.parentNode.insertBefore(wrapper, textarea);

  // Hide original textarea but keep in DOM for form submission
  textarea.style.display = 'none';
  textarea.setAttribute('data-has-editor', 'true');

  // Initialize editor
  const view = new EditorView({
    doc: textarea.value,
    extensions,
    parent: wrapper
  });

  // Store reference on textarea for later access
  textarea._cmEditor = view;
  textarea._cmOptions = options;

  // Sync changes back to textarea for form submission
  const syncToTextarea = () => {
    textarea.value = view.state.doc.toString();

    // Trigger change event for Foundry's form handling
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // Sync on blur and before form submission
  wrapper.addEventListener('blur', syncToTextarea, true);

  const form = textarea.closest('form');
  if (form) {
    form.addEventListener('submit', syncToTextarea);
  }

  return view;
}

/**
 * Destroy a CodeMirror editor instance and restore textarea
 *
 * @param {HTMLTextAreaElement} textarea - The original textarea
 *
 * @example
 * destroyJSONEditor(document.querySelector('textarea[name="system.classAbilities.fields"]'));
 */
export function destroyJSONEditor(textarea) {
  if (!textarea._cmEditor) {
    return;
  }

  const editor = textarea._cmEditor;
  const wrapper = editor.dom.parentElement;

  // Sync final value before destroying
  textarea.value = editor.state.doc.toString();

  // Destroy editor
  editor.destroy();

  // Remove wrapper
  if (wrapper && wrapper.parentNode) {
    wrapper.remove();
  }

  // Restore textarea visibility
  textarea.style.display = '';
  textarea.removeAttribute('data-has-editor');

  // Clean up references
  delete textarea._cmEditor;
  delete textarea._cmOptions;
}

/**
 * Validate JSON content in editor
 *
 * @param {EditorView} view - The editor instance
 * @returns {object} Validation result { valid: boolean, errors: Array, parsed: any }
 *
 * @example
 * const result = validateJSON(editor);
 * if (!result.valid) {
 *   console.error('JSON errors:', result.errors);
 * }
 */
export function validateJSON(view) {
  const doc = view.state.doc.toString();

  try {
    const parsed = JSON.parse(doc);
    return {
      valid: true,
      errors: [],
      parsed
    };
  } catch (error) {
    // Extract line/column from error message if possible
    const match = error.message.match(/position (\d+)/);
    const position = match ? parseInt(match[1]) : 0;

    return {
      valid: false,
      errors: [{
        message: error.message,
        severity: 'error',
        from: position,
        to: Math.min(position + 1, doc.length)
      }],
      parsed: null
    };
  }
}

/**
 * Format JSON content in editor (prettify)
 *
 * @param {EditorView} view - The editor instance
 * @param {number} [indent=2] - Number of spaces for indentation
 * @returns {boolean} True if formatted successfully, false if invalid JSON
 *
 * @example
 * if (formatJSON(editor, 2)) {
 *   ui.notifications.info("JSON formatted");
 * } else {
 *   ui.notifications.error("Invalid JSON cannot be formatted");
 * }
 */
export function formatJSON(view, indent = 2) {
  const result = validateJSON(view);

  if (!result.valid) {
    return false;
  }

  const formatted = JSON.stringify(result.parsed, null, indent);

  // Replace entire document
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: formatted
    }
  });

  return true;
}

/**
 * Minify JSON content in editor
 *
 * @param {EditorView} view - The editor instance
 * @returns {boolean} True if minified successfully, false if invalid JSON
 */
export function minifyJSON(view) {
  const result = validateJSON(view);

  if (!result.valid) {
    return false;
  }

  const minified = JSON.stringify(result.parsed);

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: minified
    }
  });

  return true;
}

/**
 * Set editor read-only state
 *
 * @param {EditorView} view - The editor instance
 * @param {boolean} readOnly - New read-only state
 */
export function setReadOnly(view, readOnly) {
  view.dispatch({
    effects: readOnlyCompartment.reconfigure(
      EditorView.editable.of(!readOnly)
    )
  });
}

/**
 * Get current value from editor
 *
 * @param {EditorView} view - The editor instance
 * @returns {string} Current document content
 */
export function getValue(view) {
  return view.state.doc.toString();
}

/**
 * Set value in editor
 *
 * @param {EditorView} view - The editor instance
 * @param {string} value - New content
 */
export function setValue(view, value) {
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: value
    }
  });
}
```

**Key Features:**
- ✅ Complete API for editor lifecycle
- ✅ Foundry-compatible theming
- ✅ Form integration with sync
- ✅ Validation helpers
- ✅ Format/minify utilities
- ✅ Well-documented with JSDoc

---

### Phase 3: Item Sheet Integration

#### 3.1: Modify Item Sheet Class

**File:** `module/sheets/item-sheet.mjs`

**Add imports:**
```javascript
import {
  initializeJSONEditor,
  destroyJSONEditor,
  validateJSON,
  formatJSON
} from '../helpers/json-editor.mjs';
```

**Add to class:**
```javascript
export class DieRpgItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  /**
   * Track JSON editor instances
   * @type {Map<HTMLTextAreaElement, EditorView>}
   * @private
   */
  #jsonEditors = new Map();

  // ... existing code ...

  /**
   * Actions performed after any render of the Application.
   */
  async _onRender(context, options) {
    await super._onRender(context, options);

    // Initialize JSON editors BEFORE drag-drop
    this._initializeJSONEditors();

    // ... existing drag-drop code ...
  }

  /**
   * Initialize CodeMirror editors for JSON fields
   * @private
   */
  _initializeJSONEditors() {
    // Only for paragon items
    if (this.document.type !== 'paragon') return;

    // Find all textareas with json-editor class
    const jsonFields = this.element.querySelectorAll('textarea.json-editor');

    for (const textarea of jsonFields) {
      // Skip if already initialized
      if (textarea._cmEditor) continue;

      const editor = initializeJSONEditor(textarea, {
        onChange: (value) => {
          // Real-time validation feedback (visual only, doesn't block)
          const result = validateJSON(editor);
          const wrapper = editor.dom.parentElement;

          if (result.valid) {
            wrapper.classList.remove('invalid');
            wrapper.classList.add('valid');
          } else {
            wrapper.classList.remove('valid');
            wrapper.classList.add('invalid');
          }
        },
        minHeight: 250,
        maxHeight: 500
      });

      this.#jsonEditors.set(textarea, editor);
    }
  }

  /**
   * Clean up editors when sheet closes
   * @override
   */
  async close(options) {
    // Destroy all JSON editors
    for (const [textarea, editor] of this.#jsonEditors) {
      destroyJSONEditor(textarea);
    }
    this.#jsonEditors.clear();

    return super.close(options);
  }

  // ... existing code ...
}
```

#### 3.2: Add Action Handlers

**Add to DEFAULT_OPTIONS.actions:**
```javascript
static DEFAULT_OPTIONS = {
  // ... existing ...
  actions: {
    // ... existing ...
    validateJSON: this._validateJSON,
    formatJSON: this._formatJSON,
    minifyJSON: this._minifyJSON,
  }
};
```

**Add action methods:**
```javascript
/**
 * Validate JSON in editor and show detailed results
 *
 * @this DieRpgItemSheet
 * @param {PointerEvent} event - The originating click event
 * @param {HTMLElement} target - The button element
 * @protected
 */
static async _validateJSON(event, target) {
  const container = target.closest('.json-editor-container');
  const textarea = container.querySelector('textarea.json-editor');

  if (!textarea || !textarea._cmEditor) {
    ui.notifications.warn("JSON editor not initialized");
    return;
  }

  const editor = textarea._cmEditor;
  const result = validateJSON(editor);

  const statusMessage = container.querySelector('.json-editor-status-message');

  if (result.valid) {
    statusMessage.textContent = '✓ Valid JSON';
    statusMessage.className = 'json-editor-status-message valid';
    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.JSONValid"));
  } else {
    statusMessage.textContent = `✗ ${result.errors[0].message}`;
    statusMessage.className = 'json-editor-status-message invalid';
    ui.notifications.error(
      game.i18n.format("DIE_RPG.Notifications.Error.JSONInvalid", {
        error: result.errors[0].message
      })
    );
  }
}

/**
 * Format (prettify) JSON in editor
 *
 * @this DieRpgItemSheet
 * @param {PointerEvent} event - The originating click event
 * @param {HTMLElement} target - The button element
 * @protected
 */
static async _formatJSON(event, target) {
  const container = target.closest('.json-editor-container');
  const textarea = container.querySelector('textarea.json-editor');

  if (!textarea || !textarea._cmEditor) {
    ui.notifications.warn("JSON editor not initialized");
    return;
  }

  const editor = textarea._cmEditor;

  if (formatJSON(editor, 2)) {
    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.JSONFormatted"));
  } else {
    ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.CannotFormatInvalidJSON"));
  }
}

/**
 * Minify JSON in editor
 *
 * @this DieRpgItemSheet
 * @param {PointerEvent} event - The originating click event
 * @param {HTMLElement} target - The button element
 * @protected
 */
static async _minifyJSON(event, target) {
  const container = target.closest('.json-editor-container');
  const textarea = container.querySelector('textarea.json-editor');

  if (!textarea || !textarea._cmEditor) {
    ui.notifications.warn("JSON editor not initialized");
    return;
  }

  const editor = textarea._cmEditor;

  if (minifyJSON(editor)) {
    ui.notifications.info(game.i18n.localize("DIE_RPG.Notifications.Success.JSONMinified"));
  } else {
    ui.notifications.error(game.i18n.localize("DIE_RPG.Notifications.Error.CannotMinifyInvalidJSON"));
  }
}
```

---

### Phase 4: Template Updates

#### 4.1: Update Paragon Abilities Template

**File:** `templates/item/paragon/abilities.hbs`

```handlebars
{{! Paragon Form Definitions Tab }}
<section
  class="tab abilities {{tab.cssClass}}"
  data-group="primary"
  data-tab="abilities"
  data-subtype="{{document.type}}"
>
  {{! Class Abilities Form Fields }}
  <fieldset class="form-section class-abilities-fields">
    <legend>Class Abilities Form Fields</legend>
    <p class="hint">These fields appear on the character's
      <strong>Class tab</strong>. Define the form structure as a JSON array.</p>

    <div class="form-group stacked json-editor-container">
      {{! Toolbar }}
      <div class="json-editor-toolbar">
        <label>Class Abilities Fields (JSON)</label>
        <div class="json-editor-actions">
          <button
            type="button"
            data-action="validateJSON"
            data-tooltip="Validate JSON syntax"
            class="json-action-button"
          >
            <i class="fas fa-check-circle"></i>
            <span>Validate</span>
          </button>
          <button
            type="button"
            data-action="formatJSON"
            data-tooltip="Format JSON (prettify)"
            class="json-action-button"
          >
            <i class="fas fa-align-left"></i>
            <span>Format</span>
          </button>
          <button
            type="button"
            data-action="minifyJSON"
            data-tooltip="Minify JSON (compact)"
            class="json-action-button"
          >
            <i class="fas fa-compress"></i>
            <span>Minify</span>
          </button>
        </div>
      </div>

      {{! Editor (will be replaced by CodeMirror) }}
      <textarea
        name="system.classAbilities.fields"
        rows="10"
        class="json-editor"
        placeholder='[{"key": "exampleField", "type": "text", "label": "Example Field", "initial": ""}]'
      >{{json system.classAbilities.fields space=2}}</textarea>

      {{! Status indicator }}
      <div class="json-editor-status">
        <span class="json-editor-status-indicator"></span>
        <span class="json-editor-status-message"></span>
      </div>

      <p class="hint">
        See Field Type Reference below for all available types and required properties.
      </p>
    </div>

    {{! Field Type Reference - EXISTING }}
    <details class="field-type-reference">
      <!-- ... existing reference content ... -->
    </details>
  </fieldset>

  {{! JSON Validation Helper - UPDATED }}
  <div class="json-validation-hint">
    <p>
      <i class="fas fa-lightbulb"></i>
      <strong>Tip:</strong>
      Use the "Validate" button to check your JSON syntax. The editor provides
      real-time syntax highlighting and error detection.
    </p>
  </div>
</section>
```

**Repeat for `advancements.hbs`** with similar structure.

---

### Phase 5: Styling

#### 5.1: Create CodeMirror Styles

**File:** `src/scss/components/_json-editor.scss`

```scss
/**
 * CodeMirror JSON Editor Styles
 * Integrates with DIE RPG theme and Foundry VTT styling
 */

.json-editor-container {
  position: relative;

  .json-editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;

    label {
      font-weight: bold;
      margin: 0;
    }

    .json-editor-actions {
      display: flex;
      gap: 0.5rem;
    }

    .json-action-button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--color-border-dark);
      background: var(--color-bg-btn);
      color: var(--color-text-dark-primary);
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:hover {
        background: var(--color-bg-btn-hover);
        border-color: var(--color-border-light);
      }

      &:active {
        background: var(--color-bg-btn-active);
      }

      i {
        font-size: 0.875rem;
      }
    }
  }

  .json-editor-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--color-bg-option);
    border: 1px solid var(--color-border-dark);
    border-radius: 3px;
    font-size: 0.875rem;
    min-height: 2rem;

    .json-editor-status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-text-dark-5);
      flex-shrink: 0;
    }

    .json-editor-status-message {
      flex: 1;
      color: var(--color-text-dark-4);

      &.valid {
        color: var(--color-success);

        + .json-editor-status-indicator {
          background: var(--color-success);
        }
      }

      &.invalid {
        color: var(--color-danger);

        + .json-editor-status-indicator {
          background: var(--color-danger);
        }
      }
    }
  }
}

/**
 * CodeMirror wrapper
 */
.codemirror-json-editor {
  border: 1px solid var(--color-border-dark);
  border-radius: 3px;
  overflow: hidden;
  transition: border-color 0.2s ease;

  &.valid {
    border-color: var(--color-success);
  }

  &.invalid {
    border-color: var(--color-danger);
  }

  // Focus state
  &:focus-within {
    outline: 2px solid var(--color-focus-outline);
    outline-offset: 2px;
  }

  // Scrollbar styling (webkit)
  .cm-scroller::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .cm-scroller::-webkit-scrollbar-track {
    background: var(--color-bg-option);
  }

  .cm-scroller::-webkit-scrollbar-thumb {
    background: var(--color-border-dark);
    border-radius: 4px;

    &:hover {
      background: var(--color-border-light);
    }
  }

  // Firefox scrollbar
  .cm-scroller {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-dark) var(--color-bg-option);
  }
}

/**
 * Fallback: If editor fails to initialize, show textarea
 */
textarea.json-editor {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;

  &[data-has-editor="true"] {
    display: none;
  }
}
```

#### 5.2: Import in Main SCSS

**File:** `src/scss/die-rpg.scss`

```scss
// ... existing imports ...

// Components
@import 'components/json-editor';

// ... rest of imports ...
```

---

### Phase 6: Localization

**File:** `lang/en.json`

Add to `Notifications.Success`:
```json
"JSONValid": "JSON is valid",
"JSONFormatted": "JSON formatted successfully",
"JSONMinified": "JSON minified successfully"
```

Add to `Notifications.Error`:
```json
"JSONInvalid": "Invalid JSON: {error}",
"CannotFormatInvalidJSON": "Cannot format invalid JSON. Fix syntax errors first.",
"CannotMinifyInvalidJSON": "Cannot minify invalid JSON. Fix syntax errors first."
```

---

### Phase 7: Documentation

#### 7.1: Update CONTRIBUTING.md

Add section:

```markdown
## Building JavaScript Bundles

This project uses Rollup to bundle CodeMirror for the JSON editor.

### Build Commands

```bash
# Build once
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Build only CSS
npm run build:css

# Build only JavaScript
npm run build:js
```

### First Time Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to generate bundles
4. Generated files:
   - `css/die-rpg.css` (from SCSS)
   - `module/lib/json-editor.min.mjs` (bundled CodeMirror)

**Important:** The bundled JavaScript file (`module/lib/json-editor.min.mjs`) is gitignored and must be built locally.
```

#### 7.2: Create Developer Guide

**File:** `docs/JSON_EDITOR.md`

```markdown
# JSON Editor Developer Guide

## Overview

The DIE RPG system uses CodeMirror 6 for editing JSON fields in paragon items.

## Architecture

### Components

1. **Bundle:** `module/lib/json-editor.min.mjs`
   - Bundled CodeMirror + extensions
   - Generated by Rollup from `module/lib/json-editor-bundle.mjs`
   - ~55KB gzipped

2. **Wrapper:** `module/helpers/json-editor.mjs`
   - API for initializing/destroying editors
   - Foundry integration
   - Theming and validation

3. **Integration:** `module/sheets/item-sheet.mjs`
   - Initializes editors on paragon items
   - Action handlers (validate, format, minify)
   - Lifecycle management

### Data Flow

```
User types in editor
  ↓
CodeMirror onChange event
  ↓
Validation (real-time)
  ↓
Update visual feedback
  ↓
On blur/submit: sync to textarea
  ↓
Form submission (normal Foundry flow)
```

## Adding Editor to New Fields

To add JSON editor to a new textarea:

1. Add `json-editor` class to textarea in template
2. Wrap in `.json-editor-container` div
3. Add toolbar and status divs (see abilities.hbs)
4. Editor will auto-initialize on render

## Customization

### Change Editor Height

```javascript
initializeJSONEditor(textarea, {
  minHeight: 300,
  maxHeight: 800
});
```

### Disable Real-time Validation

```javascript
initializeJSONEditor(textarea, {
  onChange: null // Don't show real-time feedback
});
```

### Make Read-only

```javascript
initializeJSONEditor(textarea, {
  readOnly: true
});
```

## Troubleshooting

### Editor doesn't appear

- Check browser console for errors
- Verify `npm run build` was run
- Check `module/lib/json-editor.min.mjs` exists

### Bundle size too large

- Review `module/lib/json-editor-bundle.mjs`
- Remove unused CodeMirror features
- Re-run `npm run build:js`

### Styling issues

- Check `src/scss/components/_json-editor.scss`
- Verify CSS variables are defined
- Run `npm run build:css`
```

---

## Testing Plan

### Manual Testing Checklist

- [ ] **Installation**
  - [ ] Fresh clone builds successfully
  - [ ] `npm install` completes without errors
  - [ ] `npm run build` generates bundle
  - [ ] Bundle size < 100KB gzipped

- [ ] **Editor Initialization**
  - [ ] Editor appears on paragon abilities tab
  - [ ] Editor appears on paragon advancements tab
  - [ ] Syntax highlighting works
  - [ ] Line numbers display correctly

- [ ] **Editing**
  - [ ] Can type and edit JSON
  - [ ] Auto-indent works
  - [ ] Bracket matching highlights
  - [ ] Undo/redo works (Ctrl+Z, Ctrl+Y)
  - [ ] Search works (Ctrl+F)

- [ ] **Validation**
  - [ ] Real-time validation shows errors
  - [ ] Valid JSON shows green indicator
  - [ ] Invalid JSON shows red indicator
  - [ ] Validate button shows detailed errors

- [ ] **Formatting**
  - [ ] Format button prettifies JSON
  - [ ] Minify button compacts JSON
  - [ ] Invalid JSON cannot be formatted (error shown)

- [ ] **Form Integration**
  - [ ] Changes save correctly
  - [ ] submitOnChange triggers form submission
  - [ ] Saved JSON persists after reload
  - [ ] Partial save works (Issue #2)

- [ ] **Lifecycle**
  - [ ] Editor initializes on sheet open
  - [ ] Editor destroys on sheet close
  - [ ] No memory leaks (multiple open/close cycles)
  - [ ] Re-opening sheet restores content

- [ ] **Browser Compatibility**
  - [ ] Chrome 90+
  - [ ] Firefox 88+
  - [ ] Edge 90+
  - [ ] Safari 14+ (if available)

- [ ] **Accessibility**
  - [ ] Keyboard navigation works
  - [ ] Tab moves between fields
  - [ ] Screen reader announces content
  - [ ] High contrast mode visible

- [ ] **Offline Support** (CRITICAL)
  - [ ] Works without internet
  - [ ] No CDN errors in console
  - [ ] All assets load from local bundle

---

## Rollout Plan

### Phase 1: Implementation (Week 1)
- Day 1-2: Build infrastructure setup
- Day 3-4: CodeMirror wrapper module
- Day 5: Item sheet integration
- Day 6: Template and styling
- Day 7: Testing and bug fixes

### Phase 2: Testing (Week 2)
- Day 1-2: Manual testing
- Day 3-4: Bug fixes
- Day 5: Browser compatibility testing
- Day 6-7: Performance optimization

### Phase 3: Documentation (Week 3)
- Day 1-2: Developer documentation
- Day 3-4: User guide
- Day 5: CONTRIBUTING.md updates
- Day 6-7: Final review

### Phase 4: Release
- Create PR
- Code review
- Merge to main
- Tag release
- Update CHANGELOG

---

## Maintenance

### Updating CodeMirror

To update CodeMirror packages:

```bash
# Check for updates
npm outdated

# Update specific package
npm update @codemirror/view

# Update all CodeMirror packages
npm update @codemirror/*

# Rebuild bundle
npm run build:js
```

### Bundle Size Monitoring

Track bundle size over time:

```bash
# Check current size
ls -lh module/lib/json-editor.min.mjs

# Gzipped size
gzip -c module/lib/json-editor.min.mjs | wc -c
```

Target: < 100KB gzipped

---

## Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Bundle too large | Medium | Medium | Tree-shaking, remove features |
| Browser incompatibility | Low | High | Polyfills, feature detection |
| Build complexity | Medium | Medium | Clear docs, CI integration |
| Performance issues | Low | Medium | Lazy loading, throttling |
| Accessibility problems | Low | High | Thorough testing, ARIA labels |

---

## Success Criteria

- ✅ Bundle size < 100KB gzipped
- ✅ Editor initializes in < 100ms
- ✅ Works offline (no CDN dependencies)
- ✅ Zero console errors
- ✅ Passes accessibility audit
- ✅ Works in all target browsers
- ✅ User feedback positive
- ✅ No data loss (partial save works)

---

## Future Enhancements

### Version 1.1
- JSON schema validation
- Autocomplete for field types
- Example snippets

### Version 1.2
- Visual tree editor mode
- Diff view for changes
- Export/import templates

### Version 2.0
- Monaco Editor upgrade (if bundle size acceptable)
- TypeScript support
- Advanced IntelliSense

---

## References

- [CodeMirror 6 Documentation](https://codemirror.net/docs/)
- [Foundry VTT V2 Application API](https://foundryvtt.com/api/)
- [Rollup Documentation](https://rollupjs.org/)
- [Issue #2: Partial Save Implementation](/.github/CODE_REVIEW_ISSUES.md#issue-2)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-21
**Status:** Specification Complete - Ready for Implementation
