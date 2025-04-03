# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-04-01 23:11:59 - Log of updates made.

*

## Coding Patterns
*   **Core Roll Mechanic (2025-04-02):**
    *   Determine Difficulty (0-2, GM sets).
    *   Gather d6 pool = Relevant Stat (0-4).
    *   Add Class Die? (Optional, based on class/situation).
    *   Add 1d6 per Advantage, Remove 1d6 per Disadvantage.
    *   If dice pool <= 0: Roll 2d6, take lowest result (Class Die can replace one d6).
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