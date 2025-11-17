import { ScreenGenerator } from "../../display/ScreenGenerator";
import { GamePhaseHandler } from "./GamePhaseHandler";

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

export { CombatPhaseHandler };
