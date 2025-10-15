/**
 * COMBAT LOGIC
 */

import type { Character_Enemy, Character_Hero } from "../types/characters_types.js";
import type { Battle_System } from "../types/combat_types.js";


class BattleSystem implements Battle_System{
    hero: Character_Hero;
    enemy: Character_Enemy;
    is_battle_active: boolean;
    battle_log: string[];

    constructor(hero: Character_Hero, enemy: Character_Enemy) {
        this.hero = hero;
        this.enemy = enemy;
        this.is_battle_active = true;
        this.battle_log = [];
    }
    
    player_attack() {
        const damage = this.hero.attack - this.enemy.$defense;
        this.enemy.take_damage(damage);
        this.log(`${this.hero.name} attacks for ${damage} damage!`)

        if (this.enemy.health <= 0) {
            this.log(`🎉 ${this.enemy.name} defeated!`);
            this.is_battle_active = false;
            return;
        }

        this.enemy_attack();
    }

    enemy_attack() {
        const damage = this.enemy.attack - this.hero.$defense;
        this.hero.take_damage(damage);
        this.log(`${this.enemy.name} attack for ${damage} damage!`)

        if (this.hero.health <= 0) {
            this.log(`💀 ${this.hero.name} has fallen!`);
            this.is_battle_active = false;
        }
    }

    log(message: string) {
        this.battle_log.push(message);
    }
}

export { BattleSystem }
