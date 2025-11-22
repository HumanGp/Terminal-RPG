/*=======================================================*
 |  ABSTRACT BASE CLASS FOR ALL PHASE HANDLERS           |
 *=======================================================*/

import { Game_UI } from "../../display/GameUI";
import { GameState } from "../../types/game_types";
import { GameStore } from "../GameState";

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
