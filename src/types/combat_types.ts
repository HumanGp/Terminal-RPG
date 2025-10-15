import type { Character_Enemy, Character_Hero } from "./characters_types.js";

interface Battle_System {
  hero: Character_Hero;
  enemy: Character_Enemy;
  is_battle_active: boolean;
  battle_log: Battle_Log;
  player_attack(): void;
  enemy_attack(): void;
  log(message: string): void;
}

type Battle_Log = string[]

export type { Battle_System , Battle_Log};
    
