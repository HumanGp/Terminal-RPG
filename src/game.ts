/**
 * GAME 
 */

import { Mage, Rouge, Warrior } from "./characters/Characters";
import { Hero } from "./characters/Hero";
import { Game_UI } from "./display/GameUI";
import { ScreenGenerator } from "./display/ScreenGenerator";
import { Character_Enemy, Character_Hero } from "./types/characters_types";
import { Character_Creation_Phase_Actions, World_Map_Phase_Actions } from "./types/game_types";
import { ARTS, GamePhase } from "./types/UI_types";

type CHARACTER_CHOICE = 'W' | 'M' | 'R';

class GAME {
  private hero: Character_Hero | null = null;
  private enemy: Character_Enemy | null = null;
  private ui: Game_UI;
  private currentPhase: GamePhase = "BOOT";
  private currentArea: keyof ARTS = "CORRUPTED_FOREST";

  constructor() {
    this.ui = new Game_UI();
  }

  async start() {
    try {
      await this.run_game_loop();
    } catch (error) {
      console.error("Game error:", error);
    }
  }

  private async run_game_loop() {
    while (this.currentPhase !== "GAME_OVER") {
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
    // this.ui.update_game_area(screenData.title, screenData.content);
    this.ui.update_game_area(screenData.content.join("\n"));
    this.ui.update_actions(screenData.actions);

    //show ASCII art in log area or game area
    await this.ui.add_log(screenData.asciiArt, 0); // instant display
  }

  private async handle_phase_input() {
    switch (this.currentPhase) {
      case "BOOT":
        // await this.ui.wait_for_continue();
        await this.handle_boot();
        this.currentPhase = "CHARACTER_CREATION";
        break;
      case "CHARACTER_CREATION":
        await this.handle_character_creation();
        break;
      case "WORLD_MAP":
        await this.handle_world_map_input();
        break;
      case "COMBAT":
        await this.handle_combat_input();
        break;
      case "INVENTORY":
        await this.handle_inventory_input();
        break;
    }
  }


  private handle_combat_input() {}

  private handle_inventory_input() {}

  private async handle_character_creation(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen(
      "CHARACTER_CREATION",
      null,
      null,
      "CORRUPTED_FOREST"
    );

    // Update UI with character creation screen
    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );
    await this.ui.add_log(screenData.asciiArt, 0);

    // Get character choice input
    let validInput = false;
    let input: CHARACTER_CHOICE;

    while (!validInput) {
      const userInput = await this.ui.getInput("Choose your class [W/M/R]: ");

      if (userInput === "W" || userInput === "M" || userInput === "R") {
        input = userInput;
        validInput = true;

        // Create hero and transition to next phase
        this.hero = this.create_hero(input);
        await this.ui.add_log(
          `You have chosen the path of the ${this.hero.name}!`, // i will include category
          30
        );
        await this.delay(1000);
        this.currentPhase = "WORLD_MAP";
      } else {
        await this.ui.add_log("Invalid choice! Please choose W, M, or R.", 30);
      }
    }
  }



  private async handle_world_map_input(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen('WORLD_MAP', this.hero, null);
    this.ui.updateScreen(screenData.title, screenData.content.join('\n'), screenData.actions);
    await this.ui.add_log(screenData.asciiArt, 0);

    let validInput = false;
    
    while (!validInput) {
      const input = await this.ui.getInput('Choose action: ');
      
      switch (input) {
        case '1':
          if (this.hero!.level >= 1) {
            this.currentArea = 'CORRUPTED_FOREST';
            this.currentPhase = 'COMBAT';
            validInput = true;
          } else {
            await this.ui.add_log('Area locked! Reach level 1 to enter.', 30);
          }
          break;
          
        case '2':
          if (this.hero!.level >= 4) {
            this.currentArea = 'BUG_INFESTED_CAVES';
            this.currentPhase = 'COMBAT';
            validInput = true;
          } else {
            await this.ui.add_log('Area locked! Reach level 4 to enter.', 30);
          }
          break;
          
        case 'I':
          this.currentPhase = 'INVENTORY';
          validInput = true;
          break;
          
        case 'S':
          this.currentPhase = 'SHOP';
          validInput = true;
          break;
          
        case 'Q':
          this.currentPhase = 'GAME_OVER';
          validInput = true;
          break;
          
        default:
          await this.ui.add_log('Invalid action! Use 1-4 to travel, I for inventory, S for shop, Q to quit.', 30);
      }
    }
  }

  private async handle_boot(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen(
      "BOOT",
      null,
      null,
      "CORRUPTED_FOREST"
    );

    this.ui.updateScreen(screenData.title, screenData.content.join('\n'), screenData.actions);
    await this.ui.add_log(screenData.asciiArt, 0);
    
    // Render content with typewriter effect
    for (const line of screenData.content) {
      await this.ui.add_log(line, 50);
    }
    
    await this.ui.add_log('\nPress any key to continue...', 30);
    await this.ui.waitForAnyKey();
  }

  // Add missing delay method
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fix the create_hero method to return proper hero
  private create_hero(characterChoice: CHARACTER_CHOICE): Character_Hero {
    let hero: Character_Hero;
    
    switch (characterChoice) {
      case 'W':
        hero = new Warrior("Warrior");
        break;
      case 'M':
        hero = new Mage("Mage"); // Fixed: was using Rogue for M
        break;
      case 'R':
        hero = new Rouge("Rogue"); // Fixed: was using Mage for R
        break;
      default:
        hero = new Warrior("Warrior"); // fallback
    }
    
    // Ensure hero has all required properties
    return {
      ...hero,
      gold: hero.gold || 0,
      level: hero.level || 1,
      inventory: hero.inventory || [],
      enemiesDefeated: hero.enemiesDefeated || 0
    } as Character_Hero;
  }


}

const game = new GAME;

game.start();

