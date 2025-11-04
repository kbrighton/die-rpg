# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

# Build CSS from SCSS (one-time)
Never run this: `npm run build` (ask the user to run it instead)

# Watch and auto-compile SCSS changes
Never run this: `npm run watch` (ask the user to run it instead)

# Create symlinks to Foundry installation (requires foundry-config.yaml) (Only the user has permission to ever run this)
Never run this: `npm run createSymlinks`

# Convert LevelDB compendiums to JSON for version control (Only the user has permission to ever run this)
Never run this: `npm run pushLDBtoJSON` (ask the user to run it instead)

# Convert JSON compendiums back to LevelDB for local testing (Only the user has permission to ever run this)
Never run this: `npm run pullJSONtoLDB` (ask the user to run it instead)

## Project Structure

This is a **FoundryVTT system** for the DIE RPG tabletop roleplaying game, currently under active development (work in progress).

### Key Architecture Components

- **module/die-rpg.mjs** - Main entry point that registers document classes, sheets, and hooks
- **module/data/** - DataModel classes defining the schema for actors and items:
  - `base-actor.mjs` / `base-item.mjs` - Base schemas with common fields
  - `actor-character.mjs` / `actor-npc.mjs` - Character and NPC specific data
  - `item-*.mjs` - All 9 item types (see below)
- **module/documents/** - Document classes extending Foundry's base Actor/Item classes
- **module/sheets/** - Application classes for rendering character/item sheets
- **module/helpers/** - Utility modules for dice rolling, effects, advancements, and configuration
- **src/scss/** - SASS stylesheets compiled to css/die-rpg.css
- **templates/** - Handlebars templates for actor/item sheets and partials

### Document Types Configuration

The system defines these actor types:
- `character` - Player characters
- `npc` - Non-player characters

And these item types (all 9 implemented):
- `paragon` - Character classes (Dictator, Neo, Godbinder, Fool, Emotion Knight, Master, Fallen)
- `equipment` - Weapons, armor, and gear with specials
- `look` - Appearance/clothing options with defense bonuses
- `spell` - Spells and magical abilities with specials
- `god` - Gods for Godbinder characters (with scriptures containing specials)
- `gift` - Gifts of the Fair for Neo characters (with upgrades containing specials)
- `stance` - Combat/social/emotion stances for Emotion Knights (with specials)
- `venting` - Venting abilities for Emotion Knights
- `arcaneweapon` - The Arcane Weapon for Emotion Knights

### DIE RPG Game System Specifics

The system implements a d6 dice pool mechanic where:
- Success threshold is 4+ on d6s
- Stats range from 0-4 (DEX, CON, INT, WIS, STR, CHA)
- Derived resources: Guard (DEX), Health (CON), Willpower (WIS+INT), Defense
- Uses Class Dice (d4-d20 based on paragon), Advantage/Disadvantage mechanics
- Special effects trigger on 6s (single/double/triple/quad), Critical Fails on 0 successes + rolling a 1

### Advancement System (Complete)

- **20-node triangular advancement map** with SVG visualization
- **Node unlocking** based on adjacency to selected nodes
- **Level-gated selection** - can select nodes equal to current level
- **Interactive UI** with lock/unlock icons, tooltips, and click-to-select
- **Accordion display** showing all advancements with positions and states
- **Helper functions** in `module/helpers/advancements.mjs` for state management

### Specials System (Phases 1-3 Complete)

- **Smart aggregation** from multiple sources (paragon, equipment, stances, gifts, gods)
- **State-based filtering** - only active/equipped items contribute specials
- **Source tracking** - each special knows which item it came from
- **Character sheet display** on Class tab with cost and mandatory indicators
- **Roll integration** - specials available during rolls based on 6+ dice rolled

See `.claude/specials-implementation-plan.md` for full details (Phases 1-3 done, Phases 4-5 optional).

### Localization System (Complete)

- **✅ Comprehensive i18n implementation** - All user-facing strings localized
- **✅ Hierarchical organization** - Strings organized as `DIE_RPG.Section.Subsection.key`
- **✅ Config-driven dropdowns** - NPC creature types, stance types use `DIE_RPG` config with `{{selectOptions}}` helper
- **✅ Template localization** - All templates use `{{localize}}` and `{{{localize}}}` helpers
- **✅ JavaScript localization** - All `ui.notifications` use `game.i18n.localize()` and `game.i18n.format()`
- **✅ Documentation strings** - Even GM-facing technical documentation is localizable

#### Localization Work Completed (2025)
- Fixed duplicate Dialog section and typo ("Essassin" → "Assassin")
- Added 10 missing NPCSheet.Type strings with proper hierarchical organization
- Localized ~95 template strings across 12 template files
- Localized JavaScript notification strings in dice-interaction.mjs
- Localized paragon form field type documentation (27 strings)
- Converted hard-coded dropdown options to config-driven `{{selectOptions}}`

#### Key Localization Files
- `lang/en.json` - Primary localization file (~860+ lines)
- `module/helpers/config.mjs` - Configuration registry for dropdowns (creatureTypes, stanceTypes)
- `templates/partials/dynamic-field.hbs` - Fully localized dynamic field renderer
- All template files use proper localization helpers

## Development Setup

1. Ensure Node.js is installed
2. Run `npm install` to install dependencies
3. Use `npm run build` or `npm run watch` for CSS compilation
4. For hot-reload, launch Foundry with `--hotReload` flag
5. For pack development: Must be on Foundry welcome page (not in world) to use pack conversion commands

## Important Notes

- **System version**: Built for Foundry VTT v13 (compatibility.minimum: 13)
- **Current development status** (~95-98% complete):
  - ✅ Core actor/item data models implemented
  - ✅ All 9 item types fully functional
  - ✅ Advancement system complete (map, selection, tracking)
  - ✅ Specials aggregation complete (Phases 1-3)
  - ✅ Character sheet UI working (header, stats, tabs, paragon selection)
  - ✅ Paragon class-specific ability forms COMPLETE (template-driven architecture)
  - ✅ Dynamic form rendering system COMPLETE (all 9 field types)
- **Development plans**:
  - See `.claude/PARAGON_ITEM_SHEET_PLAN.md` for the template-driven paragon forms architecture plan
    - **Status**: ~95-98% complete (Phases 1-4 complete, only optional enhancements remain)
    - **Goal**: Allow GMs to create custom paragons with class-specific forms ✅ ACHIEVED
    - **Phase 1** (Data model expansion): ✅ COMPLETE
    - **Phases 2-4** (Dynamic rendering, character sheet integration, form editors): ✅ COMPLETE
    - **Phase 5** (Optional enhancements): CodeMirror integration, visual form builder (nice-to-have)
  - See `.claude/specials-implementation-plan.md` for specials system details
    - **Status**: Phases 1-3 complete, Phases 4-5 optional (dialog and chat enhancements)
- LevelDB compendium packs require conversion to/from JSON for version control
- Uses MIT license and accepts contributions via GitHub
- Foundation system files are at module/die-rpg.mjs (main ES module entry point)

## Paragon System

### Current State: ✅ ~95-98% Complete

**What's Working:**
- ✅ **Core paragon data**: coreNature, die type, importantStat, coreAbility, looks, specials, advancements
- ✅ **Full paragon item sheet** with 7 tabs: Description, Details, Advancements, Looks, Equipment Options, Abilities, Specials
- ✅ **Template-driven form definitions**: `classAbilities.fields` and `advancementForms.fields` with 9 field types
- ✅ **Character data storage**: `classAbilityData` and `advancementData` (ObjectFields)
- ✅ **Dynamic field renderer**: Complete implementation supporting all 9 field types:
  - text, number, boolean, select, multiSelect, html, itemList, group, special
- ✅ **Form definition editors**: JSON textarea editors in paragon item sheet with field type reference
- ✅ **Character sheet integration**: Dynamic forms render on Class tab and Advancements tab
- ✅ **Character paragon selection**: UUID tracking and paragon dropdown
- ✅ **Look selection**: From paragon options with defense bonuses
- ✅ **Advancement map**: 20 nodes, interactive selection, state tracking
- ✅ **Specials aggregation**: From paragon and other items
- ✅ **Equipment options**: Array of starting equipment UUIDs
- ✅ **Theme images**: classDiceImage, portraitImage, tokenImage fields

**What's Missing (Optional Enhancements):**
- ⏳ CodeMirror integration for JSON editing (currently plain textarea - works fine)
- ⏳ Visual form builder (drag-drop UI instead of JSON - nice-to-have)
- ⏳ Visual advancement map editor for paragon items (nice-to-have)

### What This Means

✅ **GMs CAN now create custom paragon-specific abilities** like:
- Neo's "Fair Gold" (number), "Gifts" (item list), "Sick-Ass Ride" (grouped fields)
- Dictator's "Emotion Palette" (multi-select), "The Tell" (text/select)
- Emotion Knight's "Emotional Scale" (number 0-6), selected stances (dual booleans)

The template-driven architecture is **fully functional**. GMs edit JSON field definitions in the paragon item sheet, and those fields automatically appear on character sheets with proper data persistence.

### Implementation Status

✅ **COMPLETE**: Template-driven architecture from PARAGON_ITEM_SHEET_PLAN.md
- GMs can create custom paragons without code changes ✅
- Single source of truth (paragon item defines everything) ✅
- Flexible and future-proof ✅
- Phases 1-4 fully implemented ✅
- Production-ready for all 7 official paragons (Dictator, Neo, Godbinder, Fool, Emotion Knight, Master, Fallen)

## Quick Reference

### Recent Commits (past 3 weeks)
- Comprehensive localization review and improvements (4 phases)
- Advancement system implementation and refinement
- Paragon item type and data model
- Specials system and aggregation
- Item sheet layouts and UI polish
- Character sheet tabs and paragon selection

### Key Files for Paragon System
- `module/data/item/paragon.mjs` - Paragon data model (✅ complete with template-driven fields)
- `module/data/actor/character.mjs` - Character data model (✅ complete with data storage fields)
- `module/helpers/advancements.mjs` - Advancement tracking (✅ complete)
- `templates/actor/paragon.hbs` - Paragon/Class tab (✅ complete with dynamic forms)
- `templates/actor/advancements.hbs` - Advancements tab (✅ complete with dynamic forms)
- `templates/partials/dynamic-field.hbs` - Dynamic field renderer (✅ complete, all 9 types)
- `templates/item/paragon/abilities.hbs` - Form definition editor for class abilities (✅ complete)
- `templates/item/paragon/advancements.hbs` - Form definition editor for advancement forms (✅ complete)
- `templates/item/paragon/paragonDetails.hbs` - Paragon details tab (✅ complete)
- `.claude/PARAGON_ITEM_SHEET_PLAN.md` - Full implementation plan (Phases 1-4 complete)

# Task Tracking

**IMPORTANT:** All development tasks are tracked in `.claude/TASKS.md`

- **READ** `.claude/TASKS.md` at the start of every work session
- **UPDATE** task statuses when you complete work or discover new tasks
- **REFERENCE** for current priorities and next recommended work

The TASKS.md file is the single source of truth for what needs to be done.

# Research
When asked to research how to do code something for the Foundry VTT system or how does something work in the Foundry VTT System: search the local Foundry codebase, which you can fine in the `/foundry` directory of this repository. 