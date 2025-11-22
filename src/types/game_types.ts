import { Character_Enemy, Character_Hero } from "./characters_types";
import { ARTS, GamePhase } from "./UI_types";

type CHARACTER_CHOICE = 'W' | 'M' | 'R';        // character_phase inputs
type WORLD_INPUT = '1' | '2' | '3' | '4';       // world_phase inputs
type COMBAT_ACTION = 'A' | 'H' | 'D' | 'R';     // combat_phase inputs
type WARRIOR_ACTION = 'S' | 'W';                // Warrior Hero instance inputs
type ROGUE_ACTION = 'B' | 'P';                  // Rouge  hero instance inputs
type MAGE_ACTION = 'F' | 'I';                   // Mage hero instance inputs       


interface GameState {
  currentPhase: GamePhase;
  hero: Character_Hero | null;
  // enemy: Character_Enemy | null;
  currentArea: keyof ARTS;
  combatHistory: string[];
  gameStats: {
    enemiesDefeated: number;
    goldCollected: number;
    areasExplored: number;
  };
}

export type {
  CHARACTER_CHOICE,
  WORLD_INPUT,
  COMBAT_ACTION,
  WARRIOR_ACTION,
  ROGUE_ACTION,
  MAGE_ACTION,
  GameState
}