// ************* Game Over Phase Handler ***************

import { ScreenGenerator } from "../../display/ScreenGenerator";
import { GamePhaseHandler } from "./GamePhaseHandler_base";

export class GameOverPhaseHandler extends GamePhaseHandler {
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
