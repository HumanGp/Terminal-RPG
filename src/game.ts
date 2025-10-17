/**
 * GAME 
 */

import { Mage, Rouge, Warrior } from "./characters/Characters";
import { Hero } from "./characters/Hero";
import { Game_UI } from "./display/GameUI";
import { ScreenGenerator } from "./display/ScreenGenerator";
import { Character_Enemy, Character_Hero } from "./types/characters_types";
import { ARTS, GamePhase } from "./types/UI_types";

type CHARACTER_CHOICE = 'W' | 'M' | 'R';

class GAME {
  private hero: Character_Hero | null = null;
  private enemy: Character_Enemy | null = null;
  private ui: Game_UI;
  private currentPhase: GamePhase = 'BOOT';
  private currentArea: keyof ARTS = 'CORRUPTED_FOREST';

  constructor() {
    this.ui = new Game_UI();
  }

  async start() {
    try {
      await this.run_game_loop();
    } catch (error) {
      console.error('Game error:', error);
    }
  }

  private async run_game_loop() {
    while (this.currentPhase !== 'GAME_OVER') {
      await this.render_current_screen();
      await this.handle_phase_input();
    }
  }

  private async render_current_screen() {
    const screenData = ScreenGenerator.generateScreen(
      this.currentPhase,
      this.hero,
      this.enemy,
      this.currentArea
    );

    // update UI with generated screen
    this.ui.update_game_area(screenData.title, screenData.content);
    this.ui.update_actions(screenData.actions);

    //show ASCII art in log area or game area
    await this.ui.add_log(screenData.asciiArt, 0); // instant display
  }

  private async handle_phase_input() {
    switch (this.currentPhase) {
      case 'BOOT':
        await this.ui.wait_for_continue();
        this.currentPhase = 'CHARACTER_CREATION';
        break;
      case 'CHARACTER_CREATION':
        await this.handle_character_creation();
        break;
      case 'WORLD_MAP':
        await this.handle_world_map_input();
        break;
      case 'COMBAT':
        await this.handle_combat_input();
        break;
      case 'INVENTORY':
        await this.handle_inventory_input();
        break;
    }
  }

  private async handle_character_creation() {
    const input = await this.ui.getInput("Choose your class/Character");

    //Handle class selection logic
    this.currentPhase = 'WORLD_MAP'
  }

  private create_hero(characterChoice: CHARACTER_CHOICE): Character_Hero {
    //Return actual hero with all required properties
    const warrior = new Warrior("");
    const rogue = new Rouge("");
    const mage = new Mage("");
    
    switch (characterChoice) {
      case 'W':
        return warrior;
      case 'M':
        return rogue;
      case 'R':
        return mage
    }
  }
  
  
}

