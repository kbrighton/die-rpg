# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-04-01 23:07:33 - Log of updates made will be appended as footnotes to the end of this file.
2025-04-01 23:19:10 - Updated Project Goal and Key Features based on user input.


2025-04-03 16:33:54 - Added Character Creation Workflow (MVP).
*

## Project Goal

*   Create a System Package for Foundry VTT to support playing the DIE RPG.

## Key Features

*   Character Sheets
*   NPC Sheets
*   Roll Logic
*   Other helpful assets

## Overall Architecture

## Character Creation Workflow (MVP)

*(Approved 2025-04-03)*

This outlines the basic user flow for creating a character using the system, assuming necessary Compendium packs exist.

1.  **Create Actor:** User creates a new Actor of type "Character".
2.  **Assign Stats:** User manually edits the 6 core stats (STR-CHA) on the sheet header (starts at 2, add 2 points, max 4).
    *   System automatically calculates Max Guard, Max Health, Max Willpower based on stats.
3.  **Add Class:** User drags a pre-configured Class item (e.g., "Dictator") from a Compendium onto the Actor sheet.
4.  **Add Persona:** User drags a Persona item from a Compendium onto the Actor sheet.
5.  **Make Initial Choices:**
    *   User edits the added Class item to make initial choices (e.g., Dictator's Emotion Palette, EK's Weapon Traits).
    *   User reads equipment/look choices on the Class item.
    *   User drags chosen Gear items from a Compendium onto the Actor sheet.
    *   System updates Defense based on equipped Gear.
6.  **Add Starting Abilities:** User refers to the Class item and drags corresponding Ability items from a Compendium onto the Actor sheet.
7.  **Fill Descriptions:** User fills in Actor biography, Persona details (shared history, obsessions, player notes), character look description.


*