/**
 * ENEMY
 */

import type { Character_Enemy } from "../types/characters_types.js";

class Enemy implements Character_Enemy {
  name: string;
  health: number;
  attack: number;
  defense: number;
  maxHealth: number;

  constructor(name: string) {
    this.name = name;
    this.health = 100;
    this.maxHealth = 100;
    this.attack = 15;
    this.defense = 5;
  }

  take_damage(damage: number) {
    this.health -= damage;
    return this.health > 0;
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

}

export { Enemy };
