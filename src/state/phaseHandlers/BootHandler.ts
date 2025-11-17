import { LCDBootHandler } from "../../display/Boot";
import { Game_UI } from "../../display/GameUI";
import { ScreenGenerator } from "../../display/ScreenGenerator";
import { GameState } from "../../types/game_types";
import { GameStore } from "../GameState";
// import { GamePhaseHandler } from "./GamePhaseHandler";

abstract class GamePhaseHandler {
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
      "{cyan-fg}Boot sequence complete. Ready for character creation...{/cyan-fg",
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

export { BootPhaseHandler };

