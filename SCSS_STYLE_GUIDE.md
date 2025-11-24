# DIE RPG SCSS Style Guide

**Last Updated**: November 2025
**Maintainer**: Development Team

This guide documents all available SCSS mixins, utilities, and patterns for the DIE RPG Foundry VTT system. Use this as a reference when developing new features or modifying existing styles.

---

## Table of Contents

1. [Button Mixins](#button-mixins)
2. [Form Field Mixins](#form-field-mixins)
3. [Card/Panel Mixins](#cardpanel-mixins)
4. [Animation Mixins](#animation-mixins)
5. [Responsive Mixins](#responsive-mixins)
6. [Color Variables](#color-variables)
7. [Spacing Variables](#spacing-variables)
8. [Typography](#typography)
9. [Best Practices](#best-practices)

---

## Button Mixins

All button mixins are located in `src/scss/utils/_mixins.scss`.

### Basic Button Types

#### `@mixin btn-success`
**Use for**: Add, create, save, confirm actions
**Color**: Green

```scss
.my-add-button {
  @include btn-success;
}
```

#### `@mixin btn-danger`
**Use for**: Delete, remove, cancel actions
**Color**: Red

```scss
.my-delete-button {
  @include btn-danger;
}
```

#### `@mixin btn-info`
**Use for**: Edit, info, view actions
**Color**: Blue

```scss
.my-edit-button {
  @include btn-info;
}
```

#### `@mixin btn-neutral`
**Use for**: Secondary actions, less important buttons
**Color**: Gray

```scss
.my-cancel-button {
  @include btn-neutral;
}
```

### Button Size Variants

#### `@mixin btn-small`
**Use for**: Compact layouts, secondary buttons
**Size**: 12px font, reduced padding

```scss
.my-compact-button {
  @include btn-success;
  @include btn-small;  // Combine with color mixin
}
```

#### `@mixin btn-icon`
**Use for**: Icon-only buttons (24x24px)
**Size**: Square, centered icon

```scss
.my-icon-button {
  @include btn-danger;
  @include btn-icon;  // 24x24 square with centered icon
}
```

### Button Usage Examples

```scss
// Standard add button
.add-item-btn {
  @include btn-success;
}

// Small delete button
.remove-item-btn {
  @include btn-danger;
  @include btn-small;
}

// Icon-only edit button
.edit-icon-btn {
  @include btn-info;
  @include btn-icon;
}

// Custom button with override
.my-custom-btn {
  @include btn-neutral;
  // Override specific properties
  min-width: 100px;
}
```

---

## Form Field Mixins

### `@mixin form-field-base`
**Use for**: Standard form fields with label on top
**Applies to**: text, number, email, password, select, textarea

```scss
.my-form-group {
  @include form-field-base;
}
```

**Generates**:
- Label styling (14px, bold, 5px margin-bottom)
- Input styling (full width, padding, borders, focus states)
- Disabled states
- Placeholder styling

### `@mixin form-field-inline`
**Use for**: Horizontal label + input layout
**Best for**: Short labels, compact forms

```scss
.inline-field {
  @include form-field-inline;
}
```

### `@mixin form-checkbox`
**Use for**: Checkbox and radio button groups
**Features**: Proper cursor, disabled states, alignment

```scss
.my-checkbox-label {
  @include form-checkbox;
}
```

**Generated HTML structure**:
```html
<label class="my-checkbox-label">
  <input type="checkbox">
  <span>Label text</span>
</label>
```

---

## Card/Panel Mixins

### `@mixin card`
**Use for**: Standard content containers
**Style**: Padding, background, border, border-radius

```scss
.my-card {
  @include card;
}
```

### `@mixin card-highlight($color)`
**Use for**: Cards with colored left border (3px)
**Parameter**: Border color (use color variables)

```scss
.warning-card {
  @include card-highlight($c-warning-border);
}

.error-card {
  @include card-highlight($c-failure-border);
}

.info-card {
  @include card-highlight($c-info-border);
}
```

### `@mixin section-header`
**Use for**: Consistent section headers
**Style**: Uppercase, 18px font, bottom border

```scss
h3.section-title {
  @include section-header;
}
```

---

## Animation Mixins

### Transitions

#### `@mixin transition-standard`
**Duration**: 0.2s (most common)

```scss
.element {
  @include transition-standard;
}
```

#### `@mixin transition-fast`
**Duration**: 0.15s (quick interactions)

```scss
.button {
  @include transition-fast;
}
```

#### `@mixin transition-slow`
**Duration**: 0.3s (dramatic effects)

```scss
.modal {
  @include transition-slow;
}
```

### Specific Property Transitions

```scss
// Fade in/out
.fade-element {
  @include transition-opacity(0.2s);
}

// Movement
.moving-element {
  @include transition-transform(0.3s);
}

// Color changes
.color-change {
  @include transition-colors(0.2s);
}
```

### Animations

#### `@mixin animate-pulse`
**Use for**: Highlighting important elements, special dice
**Effect**: Pulsing opacity (1.0 → 0.7 → 1.0)

```scss
.special-die i {
  @include animate-pulse;
}
```

#### `@mixin animate-shake`
**Use for**: Errors, critical failures
**Effect**: Shaking rotation (-5° → 5° → 0°)

```scss
.critical-fail i {
  @include animate-shake;
}
```

#### `@mixin animate-fade-in($duration)`
**Use for**: New content appearing
**Parameter**: Duration (default 0.3s)

```scss
.new-item {
  @include animate-fade-in(0.5s);
}
```

#### `@mixin animate-slide-in-top($duration)`
**Use for**: Dropdowns, tooltips
**Parameter**: Duration (default 0.3s)

```scss
.dropdown-menu {
  @include animate-slide-in-top;
}
```

### Hover Effects

#### `@mixin hover-lift`
**Effect**: Lifts element 2px on hover with shadow

```scss
.card {
  @include hover-lift;
}
```

#### `@mixin hover-glow($color)`
**Effect**: Adds glow box-shadow on hover
**Parameter**: Glow color (default: `$c-info`)

```scss
.button {
  @include hover-glow($c-success);
}
```

---

## Responsive Mixins

### Breakpoint Values

```scss
$breakpoint-mobile: 480px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
$breakpoint-wide: 1440px;
```

### General Breakpoints

```scss
// Apply styles above a specific width
.element {
  @include respond-above($breakpoint-tablet) {
    font-size: 18px;
  }
}

// Apply styles below a specific width
.element {
  @include respond-below($breakpoint-desktop) {
    padding: 5px;
  }
}
```

### Specific Device Helpers

```scss
// Mobile only (< 768px)
.mobile-menu {
  @include mobile-only {
    display: block;
  }
}

// Tablet only (768px - 1023px)
.tablet-layout {
  @include tablet-only {
    grid-template-columns: 1fr 1fr;
  }
}

// Tablet and up (≥ 768px)
.content {
  @include tablet-and-up {
    max-width: 960px;
  }
}

// Desktop and up (≥ 1024px)
.sidebar {
  @include desktop-and-up {
    width: 300px;
  }
}

// Wide screens (≥ 1440px)
.container {
  @include wide-screen {
    max-width: 1280px;
  }
}
```

### Special Contexts

```scss
// Touch devices
.button {
  @include touch-device {
    min-height: 44px;  // Larger touch targets
  }
}

// Print styles
.page {
  @include print {
    background: white;
    color: black;
  }
}
```

---

## Color Variables

### Theme-Aware Colors

All colors use CSS custom properties that automatically adapt to light/dark themes.

#### Success (Green)
```scss
$c-success           // Main green
$c-success-text      // Text color
$c-success-bg        // Background (15% opacity)
$c-success-border    // Border (50% opacity)
```

#### Failure/Danger (Red)
```scss
$c-failure           // Main red
$c-failure-text      // Text color
$c-failure-bg        // Background (20% opacity)
$c-failure-border    // Border (50% opacity)
$c-critical          // Critical red (darker)
```

#### Warning (Orange)
```scss
$c-warning           // Main orange
$c-warning-text      // Text color
$c-warning-bg        // Background (15% opacity)
$c-warning-border    // Border (50% opacity)
```

#### Info (Blue)
```scss
$c-info              // Main blue
$c-info-text         // Text color
$c-info-bg           // Background (15% opacity)
$c-info-border       // Border (50% opacity)
```

#### Gold/Special
```scss
$c-gold              // Main gold
$c-gold-text         // Text color
$c-gold-bg           // Background (15% opacity)
$c-gold-border       // Border (50% opacity)
```

#### Grays
```scss
$c-gray-light        // #888 (light mode)
$c-gray-medium       // #666 (light mode)
$c-gray-dark         // #444 (light mode)
```

#### Base Colors
```scss
$c-white             // White/Black (theme-aware)
$c-black             // Black/White (theme-aware)
$c-dark              // Dark text color
$c-faint             // Faint text color
```

#### Overlays (Backgrounds)
```scss
$overlay-light       // 3% opacity
$overlay-medium      // 5% opacity
$overlay-dark        // 10% opacity
$overlay-darker      // 15% opacity
$overlay-darkest     // 20% opacity
$section-bg          // 4% opacity (for sections)
```

### Text Color Utilities

```scss
$text-primary        // 95% opacity (main text)
$text-secondary      // 90% opacity (secondary text)
$text-muted          // 70% opacity (muted text)
$text-disabled       // 60% opacity (disabled state)
$text-hint           // 50% opacity (placeholder/hint)
```

---

## Spacing Variables

### Padding
```scss
$padding-xs: 2px;
$padding-sm: 5px;
$padding-md: 10px;
$padding-lg: 20px;
```

### Margins
```scss
$margin-xs: 2px;
$margin-sm: 5px;
$margin-md: 10px;
$margin-lg: 20px;
```

### Gaps (for flexbox/grid)
```scss
$gap-xs: 2px;
$gap-sm: 5px;
$gap-md: 10px;
$gap-lg: 20px;
```

### Opacity Scale
```scss
$opacity-100: 1.0;
$opacity-95: 0.95;
$opacity-90: 0.9;
$opacity-85: 0.85;
$opacity-80: 0.8;
$opacity-70: 0.7;
$opacity-60: 0.6;
$opacity-50: 0.5;
$opacity-40: 0.4;
$opacity-30: 0.3;
$opacity-20: 0.2;
$opacity-15: 0.15;
$opacity-10: 0.1;
$opacity-5: 0.05;
```

---

## Typography

### Foundry Font Sizes

**Always use Foundry's font size variables** for consistency and accessibility:

```scss
var(--font-size-10)   // 0.625rem
var(--font-size-12)   // 0.75rem
var(--font-size-13)   // 0.8125rem
var(--font-size-14)   // 0.875rem
var(--font-size-15)   // 0.9375rem
var(--font-size-16)   // 1rem (base)
var(--font-size-18)   // 1.125rem
var(--font-size-20)   // 1.25rem
var(--font-size-24)   // 1.5rem
var(--font-size-28)   // 1.75rem
var(--font-size-32)   // 2rem
var(--font-size-40)   // 2.5rem
var(--font-size-48)   // 3rem
```

### Font Families
```scss
$font-primary: 'Roboto', sans-serif;
$font-heading: 'Beiruti', 'Roboto', sans-serif;
```

### Usage
```scss
// Good ✅
.text {
  font-size: var(--font-size-14);
}

// Bad ❌
.text {
  font-size: 0.875rem;  // Don't hardcode
}
```

---

## Best Practices

### 1. **Always Use Mixins for Buttons**

```scss
// Good ✅
.my-button {
  @include btn-success;
}

// Bad ❌
.my-button {
  display: flex;
  padding: 5px 10px;
  background: $c-success-bg;
  // ... 15 more lines
}
```

### 2. **Use Color Variables, Never Hardcode**

```scss
// Good ✅
.element {
  color: $text-primary;
  background: $overlay-dark;
  border: 1px solid $c-info-border;
}

// Bad ❌
.element {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid #0066cc;
}
```

### 3. **Use Spacing Variables for Consistency**

```scss
// Good ✅
.container {
  padding: $padding-md;
  margin: $margin-lg 0;
  gap: $gap-sm;
}

// Bad ❌
.container {
  padding: 10px;
  margin: 20px 0;
  gap: 5px;
}
```

### 4. **Prefer Foundry Font Sizes**

```scss
// Good ✅
.text {
  font-size: var(--font-size-14);
}

// Bad ❌
.text {
  font-size: 14px;
  font-size: 0.875rem;
  font-size: 0.9em;
}
```

### 5. **Use Card Mixins for Panels**

```scss
// Good ✅
.info-panel {
  @include card;
}

.warning-panel {
  @include card-highlight($c-warning-border);
}

// Bad ❌
.info-panel {
  padding: 10px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
```

### 6. **Combine Mixins Strategically**

```scss
// Multiple mixins work together
.compact-delete-btn {
  @include btn-danger;      // Color/style
  @include btn-small;        // Size
  @include btn-icon;         // Shape
}

.animated-card {
  @include card;             // Structure
  @include hover-lift;       // Animation
}
```

### 7. **Use Transitions for Smooth Interactions**

```scss
// Good ✅
.button {
  @include transition-standard;  // Reusable
}

// Acceptable ✓ (for specific needs)
.element {
  @include transition-opacity(0.3s);
}

// Bad ❌
.button {
  transition: all 0.2s ease;  // Repetitive
}
```

### 8. **Scope Styles Appropriately**

```scss
// Good ✅ - Scoped to .die-rpg
.die-rpg {
  .my-custom-element {
    @include card;
  }
}

// Bad ❌ - Global scope (might conflict with Foundry)
.my-custom-element {
  @include card;
}
```

### 9. **Document Complex Patterns**

```scss
// Good ✅
.advancement-node {
  // Interactive SVG node with hover states
  // See templates/actor/advancements.hbs for HTML structure
  @include transition-fast;
  cursor: pointer;

  &:hover {
    fill: $overlay-darker;
  }
}
```

### 10. **Keep Specificity Low**

```scss
// Good ✅ - Low specificity
.item-row .delete-btn {
  @include btn-danger;
  @include btn-icon;
}

// Bad ❌ - Too specific (hard to override)
.die-rpg .tab .item-list .item-row .item-actions .delete-btn {
  @include btn-danger;
}
```

---

## Quick Reference

### Common Patterns

```scss
// Add button with icon
.add-item-btn {
  @include btn-success;

  i {
    margin-right: 4px;
  }
}

// Small icon-only delete button
.delete-icon-btn {
  @include btn-danger;
  @include btn-small;
  @include btn-icon;
}

// Info card with border
.info-box {
  @include card-highlight($c-info-border);
  padding: $padding-lg;
}

// Animated special effect
.special-indicator {
  @include animate-pulse;
  color: $c-gold;
}

// Responsive layout
.grid-container {
  display: grid;
  grid-template-columns: 1fr;

  @include tablet-and-up {
    grid-template-columns: 1fr 2fr;
  }

  @include desktop-and-up {
    grid-template-columns: 300px 1fr;
  }
}
```

---

## File Locations

- **Mixins**: `src/scss/utils/_mixins.scss`
- **Variables**: `src/scss/utils/_variables.scss`
- **Colors**: `src/scss/utils/_colors.scss`
- **Typography**: `src/scss/utils/_typography.scss`
- **Grid**: `src/scss/global/_grid.scss`

---

## Questions or Issues?

If you need a new mixin or variable:
1. Check if a similar pattern exists in `_mixins.scss`
2. Consider if it's reusable (used 3+ times = create a mixin)
3. Add it to `_mixins.scss` with clear documentation
4. Update this style guide

---

**Happy styling! 🎨**
