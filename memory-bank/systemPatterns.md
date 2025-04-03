# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-04-01 23:11:59 - Log of updates made.

*

## Coding Patterns
*   **Core Roll Mechanic (2025-04-02):**
    *   **Success Threshold:** >= 4 on d6.
    *   **<= 0 Dice Pool Rule:** Roll 2d6, keep lowest result. Player can choose to substitute their Class Die for one of the d6s.
    *   **Specials:** Activated by 6+ (also counts as success). Default: Once per Special per target per roll. Double/Triple/Quad/20-Specials exist. Mandatory Specials trigger first.
    *   **Difficulty:** Set by GM (0-2). Reduces successes *after* the roll.
    *   **Combat - Turn Order:** Highest Dexterity first. Ties alternate Player/GM.
    *   **Combat - Turn Structure:** Move + Action.
    *   **Combat - Range Bands:** Melee, Close, Medium, Far.
    *   **Combat - Attacks:** Roll vs Target's Defence (as Difficulty). Hits = Successes after Difficulty. Damage = Hits remove Guard first, then Health (Wounds).
    *   **Combat - Attack Stats:** Melee=STR, Ranged=DEX, Spells=INT/WIS/CHA (Class dependent).
    *   **Combat - 0 Successes:** If attacking, attacker suffers 1 Hit. If target had 0 successes after Difficulty, next attack gains Advantage.
    *   **Dictator - Performance:** Roll Cha + D4. D4 result = base successes. Other d6 successes modify Intensity (+/- 1 per success). Intensity vs Target Willpower determines control/attack effect. Can use 'Emotional Nudge' (use D4 roll to boost another die).
    *   **Fool - Core:** Add D6 Class Die when acting foolish/daring/cavalier. Special (6+ on *any* die in pool): Roll another d6 and add to pool.
    *   **Fool - Flukes:** Mark faces of Class D6 with Circles (good) / Crosses (bad). Rolling Circle = beneficial fluke. Rolling Cross = misfortune. Rules for adding/removing marks.
    *   **Fool - If All Else Fails:** Give D6 to GM for auto-escape; GM returns it later for misfortune.
    *   **Advancement:** Classes gain abilities via Advancement Maps or specific choices (not just stat increases). Some grant spells, items, or unique resources/mechanics.
    *   **Flashbacks:** Once per session for +1 Advantage.
    *   **Optional Rules:** Critical Fail (0 success + a 1), Failing Forward (successes before difficulty -> success w/ cost/complication), Multiple Success Targets, Success Rewards, Abstraction Clocks, Situational Specials.
    *   Determine Difficulty (0-2, GM sets).
    *   **Advancement:** Occurs after major goals/regional exploration (campaign) or GM fiat (short form). Grants choice from Advancement Map + Stat point at levels 3, 6, 9, 12. Class Dice Advance at level = die sides.
    *   **Dictator - Performance (Cont.):** Can use 'Emotional Nudge' (D4 roll boosts another die). Advancements grant new emotions, multi-target improvements, spellcasting ('Signature Piece'), social manipulation ('Henchperson', 'Agent', 'One Step Ahead'), transformation ('Monster').
    *   **Fool - Core (Cont.):** Trade grants starting bonus. Fluke mechanic tracks Circles/Crosses on D6 faces. 'If All Else Fails' trades D6 for GM intervention/later complication.
    *   **Fool - Advancement:** Grants Knacks (situational advantage), Spells (Cha based), second Trade, Fluke reset ('Clean Slate'), auto-success ('Stupid Plan'), risky auto-success ('Pushing It'), alignment shifts ('Holy Fool'/'Don't Give A Fuck'), narrative control ('King For A Day'), chaos ('Clownshow'), specific luck tricks ('Clown School').
    *   **Emotion Knight - Core:** Class Die D8. Choose Sacred Emotion & Arcane Weapon (type, trait, personality). Track Emotional Scale (0-6+). Scale >= 1: Add D8 to attacks, Stance active, can Vent.
    *   **Emotion Knight - Creative Violence:** Expend Scale Level >= 2 to 'defeat' concept on scale. Roll D8 vs Scale Level determines success/cost. Resets scale to 0.
    *   **Emotion Knight - Stances/Venting:** Start with 1 Stance (passive) and 1 Venting ability (active, reduces scale by 1).
    *   Gather d6 pool = Relevant Stat (0-4).
    *   **Neo - Core:** Class Die D10. Uses Fair Gold (resource, disappears daily) to activate Gifts (techno-magic items/abilities). Can Overcharge gifts with extra Gold (D10 roll for success/complication). Starts with 1 Gift + 1 Upgrade. Can use Neotech (INT roll) to hack tech/Fallen.
    *   **Neo - Advancement:** Grants New Gift/Upgrade, passive Gold Source, Vehicle ('Sick-Ass Ride'), unique contacts/abilities ('Pawn Shop', 'Hackromancer', 'Big Score', 'Deus Ex Machina', 'Chosen of the Fair'). Class Dice Advance (Lvl 10) grants choice + allows second Defensive upgrade.
    *   **Godbinder - Core:** Class Die D12. Starts with contract/relationship (Level 1) with one God. Can add D12 to relevant rolls. Casts Scriptures (WIS + D12, Diff 0); D12=1 incurs God Debt. Can request Miracles (custom effects) by bartering with Gods (cost: Debt, Task, Favour, Promise).
    *   **Godbinder - God Debt/Trust:** Tracked per god (+/- 5). Debt can be called in by God. Trust (Relationship Lvl > 3) grants free Debt use per session.
    *   **Godbinder - Advancement:** Increasing Relationship Level with a god grants new Scriptures. Other advancements likely exist (not detailed yet).
    *   Add Class Die? (Optional, based on class/situation).
    *   Add 1d6 per Advantage, Remove 1d6 per Disadvantage.
    *   If dice pool <= 0: Roll 2d6, take lowest result (Class Die can replace one d6).
    *   **Neo - Gifts/Upgrades:** Specific items/abilities (Gun, Teleporter, Pet, etc.) activated daily with Fair Gold. Upgrades add specific effects/Specials. Limit 1 'Defensive' upgrade initially.
    *   **Neo - Overcharge:** Spend extra Fair Gold for temporary upgrade effects/boosts. D10 roll determines success/complication.
    *   **Neo - Advancement:** Grants New Gift/Upgrade, passive Gold Source, Vehicle, unique contacts/abilities. Class Dice Advance (Lvl 10) allows second Defensive upgrade.
    *   **Godbinder - Scriptures:** Specific spells granted by God Relationship Levels (Lvl 1-3). Cast with WIS+D12 (Diff 0). D12=1 incurs Debt.
    *   **Godbinder - Miracles:** Custom effects bartered with Gods (Cost: Debt, Task, Favour, Promise).
    *   **Godbinder - Trust:** Gained at Relationship Level > 3. Grants free Debt use once per session.
    *   **Godbinder - Advancement:** Increase God Relationship Levels, gain ways to manage Debt, break contracts, gain followers, create new gods. Class Dice Advance (Lvl 12) involves reallocating levels.
    *   **Master (GM) - Core:** Class Die D20. Mastery adds D20 to spells (20-Special = 2 successes). 'My Game, My Rules' allows general magic. 'Hardcore Cheating' uses Cheat Tokens (Session pool, limited by opposing players in combat) for miracles/undos. Cheating without tokens risks GM intervention.
    *   **Game Structure:** Follows Rituals (Prep, Magic Circle, Persona Gen, Char Gen, Into DIE, Closing). Later sessions build world, present Omens, lead to Climax (Vote), Endgame.
    *   **Safety Tools:** X-Card, Stars & Wishes, CATS, Lines & Veils emphasized.
    *   Roll pool.
    *   Count Successes: Each die >= 4.
    *   Apply Difficulty: Remove successes equal to Difficulty.
    *   Result: If successes remain, action succeeds.
    *   Specials: Each remaining 6+ can activate one relevant Special (once per Special per target). Mandatory Specials trigger first.

*   

## Architectural Patterns

*   

## Testing Patterns

*