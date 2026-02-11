/*=======================================================*
 |                      WORLD MAP                        |
 *=======================================================*/

import { ScreenGenerator } from "../../display/ScreenGenerator";
import { GamePhaseHandler } from "./GamePhaseHandler_base";

// ************* World Map Phase Hanlder **************
export class WorldMapPhaseHandler extends GamePhaseHandler {
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
  }

  protected async handleInput(): Promise<void> {
    let validInput = false;
    const state = this.getState();

    while (!validInput) {
      const input = await this.ui.getInput("Choose action: ");

      switch (input) {
        case "1":
          this.gameStore.setArea("FOREST_AREA");
          this.gameStore.setPhase("COMBAT");
          validInput = true;
          break;
        //  other World Maps Later...
        default:
          await this.ui.add_log("Invalid action!", 30);
      }
    }
  }

  protected async onExit(): Promise<void> {
    await this.ui.setLayout("combat");
  }
}
