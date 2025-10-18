/**
 * GAME 
 */

import { Mage, Rouge, Warrior } from "./characters/Characters";
import { Enemy } from "./characters/Enemy";
import { Hero } from "./characters/Hero";
import { Game_UI } from "./display/GameUI";
import { ScreenGenerator } from "./display/ScreenGenerator";
import { Character_Enemy, Character_Hero } from "./types/characters_types";
import { CHARACTER_CHOICE, COMBAT_ACTION, WORLD_INPUT } from "./types/game_types";
import { ARTS, GamePhase } from "./types/UI_types";

class GAME {
  private hero: Character_Hero | null = null;
  private enemy: Character_Enemy | null = new Enemy('Orge');
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
      await this.ui.add_log(
        `Game error: ${
          error instanceof Error ? error : "Unkown error occured"
        } `
      );
    }
  }

  private async run_game_loop() {
    switch (this.currentPhase) {
      case "BOOT":
        this.handle_boot_phase();
        break;
      case "CHARACTER_CREATION":
        this.handle_character_creation_phase();
        break;
      case "WORLD_MAP":
        this.handle_world_map_phase();
        break;
      case "COMBAT":
        this.handle_combat_phase();
        break;
      case "GAME_OVER":
        this.handle_game_over_phase();
        break;
    }
  }

  /**
   * PHASE 1: THIS IS THE FIRST PHASE ON GAME LAUNCH
   */
  private async handle_boot_phase(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen(
      "BOOT",
      null,
      null,
      "CORRUPTED_FOREST"
    );

    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );

    await this.ui.screen_log(screenData.asciiArt, 0);
    await this.ui.screen_log(screenData.content.join("\n"), 30);
    await this.ui.add_log("\nPress any key to continue...", 30);
    await this.ui.waitForAnyKey();
    this.currentPhase = "CHARACTER_CREATION"; // update the phase to next phase
    this.run_game_loop(); // call the loop
  }

  /**
   * PHASE 2: CREATE A CHARACTER
   */
  private async handle_character_creation_phase(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen(
      "CHARACTER_CREATION",
      null,
      null,
      "CORRUPTED_FOREST" // default level which is level 1
    );

    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );

    await this.ui.add_log(screenData.asciiArt, 0);
    this.handle_character_creation_input();
  }

  /**
   * PHASE 3: AFTER CREATING A CHARACTER CHOOSE MAP
   */
  private async handle_world_map_phase(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen(
      "WORLD_MAP",
      this.hero,
      this.enemy,
      'CORRUPTED_FOREST',
    );

    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );

    await this.ui.add_log(screenData.asciiArt, 0);
    await this.handle_world_map_input();
  }

  /**
   * PHASE 4: AFTER CHOOSING THE MAP START COMBAT
   */
  private async handle_combat_phase(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen(
      "COMBAT",
      this.hero,
      this.enemy,
      this.currentArea
    );

    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );

    //Game logics starts here
    /**
     * So I need to get the Combat data 
     * Append the data to specific areas of the screen
     * Character name
     * Health bar ASCII
     * health percentage
     * combat status
     * The gameArea will be divided into different segments 
     */

    await this.handle_combat_input();
  }

  /**
   * PHASE 5: THE Game ends
   */
  private async handle_game_over_phase(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen(
      'GAME_OVER',
      this.hero,
      this.enemy,
      this.currentArea,
    );

    this.ui.update_phase_title(screenData.title);
    this.ui.update_game_area(screenData.content.join("\n"));
    this.ui.update_actions(screenData.actions);

    await this.ui.add_log(screenData.asciiArt, 0);
    await this.handle_game_over_input();
  }

  private async render_current_screen() {
    /**
     * There is a logic issue i need to fix in ScreenGenerator
     * The class constroctor should not take 4 parameters by default
     * This is because some methods even only need one param
     */
    const screenData = ScreenGenerator.generateScreen(
      this.currentPhase,
      this.hero,
      this.enemy,
      this.currentArea
    );

    // update UI with generated screen
    this.ui.update_phase_title(screenData.title);
    this.ui.update_game_area(screenData.content.join("\n"));
    this.ui.update_actions(screenData.actions);

    //show ASCII art in log area or game area
    await this.ui.add_log(screenData.asciiArt, 0); // instant display
  }

  private handle_inventory_input() {}

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * SEPARATE INPUT HANDLING FROM THE REST OF THE GAME LOGIC
   */

  private async handle_character_creation_input() {
    let validInput = false;
    let input: CHARACTER_CHOICE;

    while (!validInput) {
      const userInput = await this.ui.getInput(
        "Choose your character [W/M/R]: "
      );

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
        this.currentPhase = "WORLD_MAP"; //update phase
        this.run_game_loop(); //call game loop
      } else {
        await this.ui.add_log("Invalid choice! Please choose W, M, or R.", 30);
      }
    }
  }

  //create hero helper
  private create_hero(characterChoice: CHARACTER_CHOICE): Character_Hero {
    let hero: Character_Hero;

    switch (characterChoice) {
      case "W":
        hero = new Warrior("Warrior");
        break;
      case "M":
        hero = new Mage("Mage");
        break;
      case "R":
        hero = new Rouge("Rogue");
        break;
      default:
        hero = new Warrior("Warrior"); // fallback
    }

    return hero;
  }

  private async handle_world_map_input() {
   
    let validInput = false;

    /**
     * Currently  handling input 1 though not the desired logic
     */
    while (!validInput) {
      const input = await this.ui.getInput("Choose action: ") as WORLD_INPUT;

      switch (input) {   
        case "1":
          if (this.hero!.level >= 1) {
            await this.delay(1000);
            this.currentArea = "CORRUPTED_FOREST";
            this.currentPhase = "COMBAT";
            validInput = true;
            this.run_game_loop();
          } else {
            await this.ui.add_log("Area locked! Reach level 1 to enter.", 30);
          }
          break;

        case "2":
          if (this.hero!.level >= 4) {
            this.currentArea = "BUG_INFESTED_CAVES";
            this.currentPhase = "COMBAT";
            validInput = true;
          } else {
            await this.ui.add_log("Area locked! Reach level 4 to enter.", 30);
          }
          break;
        case "3":
          if (this.hero!.level >= 7) {
            this.currentArea = "GLITCH_CANYON";
            this.currentPhase = "COMBAT";
            validInput = true;
          } else {
            await this.ui.add_log("Area locked! Reach level 7 to enter.", 30);
          }
          break;
        case "4":
          if (this.hero!.level >= 10) {
            this.currentArea = "KERNEL_CITADEL";
            this.currentPhase = "COMBAT";
            validInput = true;
          } else {
            await this.ui.add_log("Area locked! Reach level 10 to enter.", 30);
          }
          break;
        default:
          await this.ui.add_log(
            "Invalid action! Use 1-4 to travel, I for inventory, S for shop, Q to quit.",
            30
          );
      }
    } 
  }

  private async handle_combat_input() {
    let validInput = false;

    while (!validInput) {
      const input = await this.ui.getInput('Make a move: ') as COMBAT_ACTION;

      /**
       * Currently supporting [R] run command to test all phases
       */
      switch (input) {
        case 'R':
          await this.delay(1000);
          this.currentPhase = 'GAME_OVER';
          validInput = true;
          this.run_game_loop();
          break;
        default:
          await this.ui.add_log('Invalid Input', 30)
      }
    }
  }

  private async handle_game_over_input() {
    let validInput = false;

    while (!validInput) {
      const input = await this.ui.getInput('Choose action: ');

      switch (input) {
        case 'R':
          await this.delay(1000);
          this.currentPhase = 'BOOT';
          validInput = true;
          this.run_game_loop();
          break;
        // case 'Q':
        //   //triger the quit event which is embeded on the screen object
        //   ''
        //   break;
        default:
          await this.ui.add_log('Choose [R] or [Q]')
      }
    }
  }
}

const game = new GAME;
game.start();

