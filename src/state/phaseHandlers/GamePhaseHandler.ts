import { Mage, Rogue, Warrior } from "../../components/characters/Characters";
import { LCDBootHandler } from "../../display/Boot";
import { Game_UI } from "../../display/GameUI";
import { ScreenGenerator } from "../../display/ScreenGenerator";
import type { CHARACTER_CHOICE, GameState } from "../../types/game_types";
import { GameStore } from "../GameState";
// import { BootPhaseHandler } from "./BootHandler";
// import { CharacterCreationPhaseHandler } from "./CharacterCreationPhaseHandler";
// import { CombatPhaseHandler } from "./CombatPhaseHandler";
// import { GameOverPhaseHandler } from "./GameOverPhaseHandler";
// import { WorldMapPhaseHandler } from "./WorldMapPhaseHanlder";


/*=======================================================*
 |  ABSTRACT BASE CLASS FOR ALL PHASE HANDLERS           |
 *=======================================================*/

export abstract class GamePhaseHandler {
  protected gameStore: GameStore;
  protected ui: Game_UI;

  constructor(gameStore: GameStore, ui: Game_UI) {
    this.gameStore = gameStore;
    this.ui = ui;
  }

  // Template method pattern - defines the sequence
  async execute(): Promise<void> {
    await this.onEnter();
    await this.render();
    await this.handleInput();
    await this.onExit();
  }

  // Abstract methods that subclasses must implement
  protected abstract onEnter(): Promise<void>;
  protected abstract render(): Promise<void>;
  protected abstract handleInput(): Promise<void>;
  protected abstract onExit(): Promise<void>;

  // Helper method for delays
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get current state
  protected getState(): GameState {
    return this.gameStore.getState();
  }
}

/*=======================================================*
 |       CONCRETE PHASE HANDLERS                         |
 *=======================================================*/


class BootPhaseHandler extends GamePhaseHandler {
  private lcdBoot: LCDBootHandler;

  constructor(gameStore: GameStore, ui: Game_UI) {
    super(gameStore, ui);
    this.lcdBoot = new LCDBootHandler(ui);
  }

  protected async onEnter(): Promise<void> {
    // LCD for boot sequence
    await this.lcdBoot.executeBootSequence();

    //Transition message
    await this.ui.add_log(
      "{cyan-fg}Boot sequence complete. Ready for character creation...{/cyan-fg}",
      30
    );
  }

  protected async render(): Promise<void> {
    // Minimal rendering since LCD handles the visual boot
    const screenData = ScreenGenerator.generateScreen("BOOT");
    this.ui.update_actions(screenData.actions);
  }

  protected async handleInput(): Promise<void> {
    await this.ui.add_log("\nPress any key to continue...", 30);
    await this.ui.waitForAnyKey();
  }

  protected async onExit(): Promise<void> {
    //clear LCD for next phase
    this.ui.clear_lcd();
    //this.ui.set_lcd_label('STANDBY')
    this.gameStore.setPhase("CHARACTER_CREATION");
  }

  //test
  async test() {
    this.onEnter();
  }
}


class CharacterCreationPhaseHandler extends GamePhaseHandler {
  protected async onEnter(): Promise<void> {
    await this.ui.add_log("Character creation started...", 30);
  }

  protected async render(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen("CHARACTER_CREATION");
    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );
    await this.ui.add_log(screenData.asciiArt, 0);
  }

  protected async handleInput(): Promise<void> {
    let validInput = false;

    while (!validInput) {
      const userInput = await this.ui.getInput(
        "Choose your character [W/M/R]: "
      );

      if (userInput === "W" || userInput === "M" || userInput === "R") {
        // Create hero based on choice
        const hero = this.createHero(userInput);
        this.gameStore.setHero(hero);

        await this.ui.add_log(
          `You have chosen the path of the ${hero.name}!`,
          30
        );
        await this.delay(1000);
        validInput = true;
      } else {
        await this.ui.add_log("Invalid choice! Please choose W, M, or R.", 30);
      }
    }
  }

  private createHero(choice: CHARACTER_CHOICE, name: string = ''): any {
    let hero;
    switch (choice) {
      case 'W':
        hero = new Warrior(name)
        break;
      case 'R':
        hero = new Rogue(name)
        break;
      case 'M':
        hero = new Mage(name)
        break;
      default:
        hero = new Warrior(name)
        break;
    }
    return hero;
  }

  protected async onExit(): Promise<void> {
    this.gameStore.setPhase("WORLD_MAP");
  }
}

class WorldMapPhaseHandler extends GamePhaseHandler {
  protected async onEnter(): Promise<void> {
    await this.ui.add_log("Entering world map...", 30);
  }

  protected async render(): Promise<void> {
    const state = this.getState();
    const screenData = ScreenGenerator.generateScreen("WORLD_MAP", state.hero);
    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );
    await this.ui.add_log(screenData.asciiArt, 0);
  }

  protected async handleInput(): Promise<void> {
    let validInput = false;
    const state = this.getState();

    while (!validInput) {
      const input = await this.ui.getInput("Choose action: ");

      switch (input) {
        case "1":
          if (state.hero!.level >= 1) {
            this.gameStore.setArea
            ("CORRUPTED_FOREST");
            this.gameStore.setPhase("COMBAT");
            validInput = true;
          } else {
            await this.ui.add_log("Area locked! Reach level 1 to enter.", 30);
          }
          break;
        // Add other cases...
        default:
          await this.ui.add_log("Invalid action!", 30);
      }
    }
  }

  protected async onExit(): Promise<void> {
    // Cleanup if needed
  }
}

class CombatPhaseHandler extends GamePhaseHandler {
  protected async onEnter(): Promise<void> {
    const state = this.getState();
    this.gameStore.addCombatMessage(`Entering combat in ${state.currentArea}`);
  }

  protected async render(): Promise<void> {
    const state = this.getState();
    const screenData = ScreenGenerator.generateScreen(
      "COMBAT",
      state.hero,
      state.enemy,
      state.currentArea
    );

    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );
    await this.ui.add_log(screenData.asciiArt, 0);
  }

  protected async handleInput(): Promise<void> {
    let validInput = false;

    while (!validInput) {
      const input = await this.ui.getInput("Make a move: ");

      switch (input) {
        case "R":
          await this.delay(1000);
          this.gameStore.setPhase("GAME_OVER");
          validInput = true;
          break;
        default:
          await this.ui.add_log("Invalid Input", 30);
      }
    }
  }

  protected async onExit(): Promise<void> {
    this.gameStore.clearCombatHistory();
  }
}



class GameOverPhaseHandler extends GamePhaseHandler {
  protected async onEnter(): Promise<void> {
    await this.ui.add_log("Game over phase entered...", 30);
  }

  protected async render(): Promise<void> {
    const state = this.getState();
    const screenData = ScreenGenerator.generateScreen("GAME_OVER", state.hero);
    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );
    await this.ui.add_log(screenData.asciiArt, 0);
  }

  protected async handleInput(): Promise<void> {
    let validInput = false;

    while (!validInput) {
      const input = await this.ui.getInput("Choose action: ");

      switch (input) {
        case "R":
          await this.delay(1000);
          this.gameStore.reset();
          validInput = true;
          break;
        default:
          await this.ui.add_log("Choose [R] or [Q]", 30);
      }
    }
  }

  protected async onExit(): Promise<void> {
    // Final cleanup if needed
  }
}


// Phase Handler Factory
class PhaseHandlerFactory {
  static createHandler(
    phase: string,
    gameStore: GameStore,
    ui: Game_UI
  ): GamePhaseHandler {
    switch (phase) {
      case "BOOT":
        return new BootPhaseHandler(gameStore, ui);
      case "CHARACTER_CREATION":
        return new CharacterCreationPhaseHandler(gameStore, ui);
      case "WORLD_MAP":
        return new WorldMapPhaseHandler(gameStore, ui);
      case "COMBAT":
        return new CombatPhaseHandler(gameStore, ui);
      case "GAME_OVER":
        return new GameOverPhaseHandler(gameStore, ui);
      default:
        throw new Error(`Unknown phase: ${phase}`);
    }
  }
}

export {
  PhaseHandlerFactory,
  BootPhaseHandler,
  CharacterCreationPhaseHandler,
  WorldMapPhaseHandler,
  CombatPhaseHandler,
  GameOverPhaseHandler,
};
