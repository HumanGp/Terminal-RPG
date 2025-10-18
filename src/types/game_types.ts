
type CHARACTER_CHOICE = 'W' | 'M' | 'R';        // character_phase inputs
type WORLD_INPUT = '1' | '2' | '3' | '4';       // world_phase inputs
type COMBAT_ACTION = 'A' | 'H' | 'D' | 'R';     // combat_phase inputs
type WARRIOR_ACTION = 'S' | 'W';                // Warrior Hero instance inputs
type ROGUE_ACTION = 'B' | 'P';                  // Rouge  hero instance inputs
type MAGE_ACTION = 'F' | 'I';                   // Mage hero instance inputs       


export type {
  CHARACTER_CHOICE,
  WORLD_INPUT,
  COMBAT_ACTION,
  WARRIOR_ACTION,
  ROGUE_ACTION,
  MAGE_ACTION,
}