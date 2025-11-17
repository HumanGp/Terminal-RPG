import { ScreenGenerator } from "../../display/ScreenGenerator";
import { GamePhaseHandler } from "./GamePhaseHandler";

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
            this.gameStore.setArea("CORRUPTED_FOREST");
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

export { WorldMapPhaseHandler };
