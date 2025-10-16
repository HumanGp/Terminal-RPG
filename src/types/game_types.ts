import { ReadLine, ReadLineOptions } from "readline";
import type { Character_Enemy, Character_Hero } from "./characters_types.js";
import type { Battle_System } from "./combat_types.js";

interface Game_ {
  hero: Character_Hero;
  enemy: Character_Enemy;
  battle: Battle_System;
  
  start(): void;
  battle_loop(): void;
  handleInput(input: Input): void;
  end_battle(): void;
}

type Input = "a" | "h" | "r" | string;

export type {Game_, Input}