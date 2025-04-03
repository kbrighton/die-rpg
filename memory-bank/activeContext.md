# Active Context

  This file tracks the project's current status, including recent changes, current goals, and open questions.





2025-04-01 23:29:41 - Updated Current Focus after completing analysis and proposing plan.


2025-04-01 23:32:25 - Updated Current Focus & Open Questions: Need detailed DIE RPG ruleset.






2025-04-03 16:18:46 - Completed reading rules doc. Updated System Patterns and identified final implementation needs.
2025-04-03 16:18:05 - Updated System Patterns and identified further implementation needs after reading rules doc (part 4).
*   Read rules doc (part 5 - end). Detailed Neo/Godbinder/Master mechanics & advancement, Rituals/Game Structure, Safety Tools.
2025-04-03 16:17:20 - Updated System Patterns and identified further implementation needs after reading rules doc (part 3).
*   Read rules doc (part 4). Detailed Neo Gifts/Upgrades/Advancement (Fair Gold, Overcharge, Neotech), Godbinder core mechanics (Scriptures, Miracles, God Debt/Trust), specific God examples.
2025-04-03 16:15:59 - Updated System Patterns and identified further implementation needs after reading rules doc (part 2).
*   Read rules doc (part 3). Detailed Dictator/Fool advancements, EK core mechanics (Sacred Emotion, Arcane Weapon, Emotional Scale, Creative Violence, Stances, Venting).
2025-04-03 16:14:24 - Updated System Patterns and identified refined implementation needs after reading rules doc (part 1).
*   Read rules doc (part 2). Detailed Dictator performance/advancement, Fool core mechanics (D6 add, Special, Flukes, If All Else Fails), advancement structure.
2025-04-02 17:49:03 - Updated Current Focus & System Patterns after clarifying core roll mechanic.
*   Read first part of `DIE-Rules.md`. Confirmed core mechanics, combat flow, stats, resources, specials, flashbacks. Noted Dictator specifics.
*   Completed initial codebase analysis (Data Models, Sheets, Templates, Helpers, Document Classes).
*   Confirmed core roll mechanic details (d6 pool, >=4 success, Adv/Disadv, Difficulty, Specials).
*   Plan refinement blocked pending detailed DIE RPG ruleset information.

*   [Refined] Need to implement Class Die substitution logic for <=0 dice pools.
*   Need specific rules for Stats, Rolls, Classes, Items, Spells, NPCs.
*   [Refined] Need specific roll logic for Dictator Performance.
*   [Refined] Need to implement optional rules like Critical Fail and Failing Forward.
*   [Refined] Need data model/UI for tracking EK Emotional Scale.
*   [Refined] Need specific roll logic/tracking for Fool's D6 add & Special.
*   [Refined] Need data model/UI for tracking Neo Fair Gold.
*   [Refined] Need data model/UI for EK Arcane Weapon details (type, trait, personality).
*   [Refined] Need data model/UI for tracking Master Cheat Tokens.
*   [Refined] Need data model/UI for tracking Godbinder God Debt & Trust (per god).
*   [Refined] Need specific roll logic for Neo Overcharge.
*   Developed a 3-phase plan to correct core mechanics (Stats, Rolls, Spells) and UI elements to align with DIE RPG rules.
*   [Refined] Need to model Neo Gifts/Upgrades (likely as 'ability' items with Fair Gold cost).
*   [Refined] Need specific roll logic for Neo Overcharge & Neotech.
*   [Refined] Need to model Godbinder Scriptures (as 'ability' items).
*   [Refined] Need data model/UI for tracking chosen Advancements (potentially structured).
*   [Refined] Need robust Advancement tracking on Actor sheet.
*   [Refined] Need specific roll logic for Godbinder Scriptures (WIS+D12, Debt on 1) & Miracles (negotiation).
*   [Refined] Need data model/UI for tracking Fool's Flukes (marked dice faces).
*   [Refined] Need to decide how to model Neo Gifts (Gear? Ability? New Type?).
*   [Refined] Need specific roll logic for EK Creative Violence.
*   [Refined] Need to handle specific attack stats (Melee=STR, Ranged=DEX, Spells=INT/WIS/CHA).
*   [Refined] Need to handle passive Stances and active Venting abilities.
*   [Refined] Need data model/UI for tracking class-specific resources/states (EK Scale, Neo Gold, Godbinder Debt, Master Tokens).

*   [Refined] Item models ('class', 'ability') need significant refinement to handle specific advancement choices and unique mechanics.
*   [Refined] Need to handle consequences of 0 successes on attack rolls.
*   Awaiting user review and approval of the proposed plan.
*   [Refined] Need to implement Flashback tracking/usage.















*   ~~**Issue:** Dice helper (`dice.mjs`) rolls correct d6 pools but lacks DIE RPG success counting logic in chat output.~~ (Clarified, needs implementation)




*   ~~**Issue:** Item roll logic (`item.roll()`) currently only works for 'gear' (using incorrect formula) and lacks DIE RPG success counting.~~ (Clarified, needs implementation)


2025-04-01 23:29:03 - Updated Recent Changes & Open Questions after reviewing item document class.
2025-04-01 23:28:49 - Updated Recent Changes & Open Questions after reviewing actor document class.
2025-04-01 23:28:31 - Updated Recent Changes after reviewing effects helper.
2025-04-01 23:28:14 - Updated Recent Changes & Open Questions after reviewing dice helper.
2025-04-01 23:28:00 - Updated Recent Changes & Open Questions after reviewing item spell attributes template.
*   Reviewed `module/documents/item.mjs` - defines base item class, roll data prep, and basic roll logic.
2025-04-01 23:27:39 - Updated Recent Changes & Open Questions after reviewing item gear attributes template.
*   Reviewed `module/documents/actor.mjs` - extends base Actor, merges data model roll data. Lacks custom derived data logic.
2025-04-01 23:27:27 - Updated Recent Changes after reviewing item feature attributes template.
*   **Issue:** Item roll logic (`item.roll()`) currently only works for 'gear' (using incorrect formula) and lacks DIE RPG success counting.
*   Reviewed `module/helpers/effects.mjs` - standard helper to categorize Active Effects for display.
*   **Issue:** Item document class (`item.mjs`) is missing implementation for `prepareDerivedData`.
*   **Issue:** Actor document class (`actor.mjs`) is missing implementation for `prepareDerivedData` (e.g., calculating modifiers, totals).
2025-04-01 23:27:09 - Updated Recent Changes after reviewing item effects template.
*   Reviewed `module/helpers/dice.mjs` - handles stat rolls using d6 pools based on (incorrect) stat values.
2025-04-01 23:26:54 - Updated Recent Changes after reviewing item description template.
*   Reviewed `templates/item/attribute-parts/spell.hbs` - displays input for incorrect `spellLevel` field.
*   **Issue:** Dice helper (`dice.mjs`) rolls correct d6 pools but lacks DIE RPG success counting logic in chat output.
2025-04-01 23:26:42 - Updated Recent Changes after reviewing item header template.
*   **Critical Issue Confirmation:** Spell attributes template (`spell.hbs`) reflects the incorrect D&D spell level concept.
*   Reviewed `templates/item/attribute-parts/gear.hbs` - displays inputs for roll formula components (num dice, size, bonus).
*   **Issue Confirmation:** Gear attributes template (`gear.hbs`) reflects the incorrect D&D-style roll formula structure.
2025-04-01 23:26:20 - Updated Recent Changes after reviewing actor effects template.
*   Reviewed `templates/item/attribute-parts/feature.hbs` - currently empty, matching the feature data model.
2025-04-01 23:26:07 - Updated Recent Changes & Open Questions after reviewing actor spells template.
*   Reviewed `templates/item/effects.hbs` - standard display/management of Active Effects on items (similar to actor effects).
2025-04-01 23:25:55 - Updated Recent Changes after reviewing actor gear template.
*   Reviewed `templates/item/description.hbs` - uses standard ProseMirror editor for item description.
2025-04-01 23:25:43 - Updated Recent Changes after reviewing actor features template.
*   Reviewed `templates/item/header.hbs` - displays image, name, and quantity/weight for Gear items.
2025-04-01 23:25:29 - Updated Recent Changes after reviewing actor biography template.
*   Reviewed `templates/actor/effects.hbs` - standard display/management of Active Effects grouped by type (passive, temporary, inactive).
2025-04-01 23:25:07 - Updated Recent Changes & Open Questions after reviewing actor header template.
*   Reviewed `templates/actor/spells.hbs` - groups spells by incorrect `spellLevel` (0-9). Image is rollable.
2025-04-01 23:24:44 - Updated Recent Changes after reviewing item sheet class.
*   Reviewed `templates/actor/gear.hbs` - similar to features list, but displays the roll formula. Image is rollable.
2025-04-01 23:24:27 - Updated Recent Changes after reviewing actor sheet class (part 2).
*   Reviewed `templates/actor/features.hbs` - standard item list display with create/edit/delete controls. Image is rollable.
*   **Critical Issue:** Spell tab layout (`spells.hbs`) is based entirely on incorrect D&D spell levels and needs complete redesign for DIE RPG mechanics.
2025-04-01 23:24:03 - Updated Recent Changes & Open Questions after reviewing actor sheet class (part 1).
*   Reviewed `templates/actor/biography.hbs` - uses standard ProseMirror editor for biography.
2025-04-01 23:23:45 - Updated Recent Changes & Open Questions after reviewing spell item data model.
*   Reviewed `templates/actor/header.hbs` - displays image, name, stats, resources, level/CR.
2025-04-01 23:23:31 - Updated Recent Changes after reviewing feature item data model.
*   Reviewed `module/sheets/item-sheet.mjs` - defines sheet structure, context prep, handles Active Effect management on items.
2025-04-01 23:23:14 - Updated Recent Changes & Open Questions after reviewing gear item data model.
*   Reviewed `module/sheets/actor-sheet.mjs` (part 2) - handles drag/drop (Items, Effects, Folders), sorting, and disables overridden fields.
*   **Issue:** Actor sheet header (`header.hbs`) references non-existent `power` resource. Should display `guard`, `willpower`, `defense`.
2025-04-01 23:23:03 - Updated Recent Changes after reviewing base item data model.
*   **Issue:** Actor sheet header (`header.hbs`) references non-existent `cr` and `xp` fields for NPCs. Should display relevant NPC data.
*   Reviewed `module/sheets/actor-sheet.mjs` (part 1) - defines sheet structure, context prep, actions.
*   **Issue Confirmation:** Actor sheet header (`header.hbs`) confirms display/rolling of incorrect stats (str, dex, etc.).
2025-04-01 23:22:46 - Updated Recent Changes & Open Questions after reviewing config file.
*   Reviewed `module/data/item-spell.mjs` - adds a `spellLevel` (1-9) field.
2025-04-01 23:21:29 - Updated Recent Changes after reviewing NPC actor data model.
*   Reviewed `module/data/item-feature.mjs` - currently adds no fields beyond base description.
2025-04-01 23:20:55 - Updated Recent Changes after reviewing character actor data model.
*   **Issue Confirmation:** Actor sheet sorts spells by `spellLevel` (0-9), reinforcing the need to redesign spell handling for DIE RPG.
*   Reviewed `module/data/item-gear.mjs` - adds quantity, weight, and a structured roll formula.
*   **Potential Issue:** `spellLevel` field in `item-spell.mjs` is incorrect for DIE RPG; needs replacement with relevant mechanics (Class Dice, cost, etc.).
2025-04-01 23:20:18 - Updated Recent Changes after reviewing base actor data model.
*   Reviewed `module/data/base-item.mjs` - defines only a common `description` field.
2025-04-01 23:19:30 - Updated Current Focus after reviewing core system files.
*   Reviewed `module/helpers/config.mjs` - defines stats, resources, NPC types using localization keys.
*   **Potential Issue:** Default roll formula in `item-gear.mjs` (1d20+mods) is incorrect for DIE RPG's d6 pool system.
  2025-04-01 23:07:54 - Log of updates made.
*   Reviewed `module/data/actor-npc.mjs` - adds abilities array, NPC type/subtype fields.

*   Reviewed `module/data/actor-character.mjs` - adds level, paragonType, look, player persona fields.
*   **Potential Issue:** Stats defined in `config.mjs` (str, dex, etc.) do not match standard DIE RPG stats (Persona, Dictator, etc.). Needs verification and correction.
*
*   Reviewed `module/data/base-actor.mjs` - defines common resources, biography, and dynamic stats.

*   Understanding the existing codebase structure (reviewed `system.json`, `module/die-rpg.mjs`).
## Current Focus

*   

## Recent Changes

*   

## Open Questions/Issues

*