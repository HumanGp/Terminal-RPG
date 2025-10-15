/**
 * GAME 
 */
import { Hero } from "./characters/Hero.js";
import { Enemy } from './characters/Enemy.js';
import { UI } from './display/UI.js';
import { BattleSystem } from './combat/BattleSystem.js';
import * as readline from 'readline' ;
import type { Character_Enemy, Character_Hero } from "./types/characters_types.js";
import type { Battle_System } from "./types/combat_types.js";
import type { Game_, Input } from "./types/game_types.js";



class Game implements Game_{
    hero: Character_Hero;
    enemy: Character_Enemy;
    battle: Battle_System;
    rl: {};

    constructor() {
        this.hero = new Hero("Brave Adventurer");
        this.enemy = new Enemy("Lucifer");
        this.battle = new BattleSystem(this.hero, this.enemy);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    start() {
        console.log("🎮 Welcome to Terminal RPG!");
        this.battle_loop();
    }

    battle_loop() {
        if (!this.battle.is_battle_active) {
            this.end_battle();
            return;
        }
    
        UI.display_battle(this.hero, this.enemy, this.battle.battle_log);
        UI.display_menu();
        
        this.rl.question("", (input: Input) => {
             this.handleInput(input.toLowerCase());
             this.battle_loop();
        });
    }
 
    handleInput(input: Input) {
      switch (input) {
          case 'a':
              this.battle.player_attack();
              break;
          case 'h':
              this.hero.heal(20);
              this.battle.log(`${this.hero.name} heals for 20 HP!`);
              this.battle.enemy_attack();
              break;
          case 'r':
              this.battle.log("You fled from battle!");
              this.battle.is_battle_active = false;
              break;
          default:
              this.battle.log("Invalid command!");
      }
    }
    
    end_battle(){
       UI.display_battle(this.hero, this.enemy, this.battle.battle_log);
       console.log(this.hero.health > 0 ? "🎉 You won!" : "💀 Game Over!");
       this.rl.close();
    }
}

const game = new Game();
game.start();
