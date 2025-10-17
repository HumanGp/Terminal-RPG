import { ReadLine, ReadLineOptions } from "readline";
import type { Character_Enemy, Character_Hero } from "./characters_types.js";
import type { Battle_System } from "./combat_types.js";

interface Game_ {
  battle: Battle_System;
  
  start(): void;
  battle_loop(): void;
  handleInput(input: Input): void;
  end_battle(): void;
  currentState: Game_State
}

type Game_State = 'EXPLORING' | 'IN_COMBAT' | 'IN_MENU' | 'GAME_OVER'

type Input = "a" | "h" | "r" | string;

export type {Game_, Input , Game_State}