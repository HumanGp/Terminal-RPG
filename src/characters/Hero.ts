/**
 * HERO
 */

import type { Character_Hero } from "../types/characters_types.js";

class Hero implements Character_Hero {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  inventory: string[];
  level: number;

  constructor(name: string) {
    this.name = name;
    this.level = 1;
    this.health = 100;
    this.maxHealth = 100;
    this.attack = 15;
    this.defense = 5;
    this.inventory = [];
  }

  take_damage(damage: number) {
    this.health -= damage;
    return this.health > 0;
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

}

export { Hero };
