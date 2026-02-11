/*=======================================================*
 |                        BOOT                           |
 *=======================================================*/

import { LCDBootHandler } from "../../display/Boot";
import { Game_UI } from "../../display/GameUI";
import { ScreenGenerator } from "../../display/ScreenGenerator";
import { GameStore } from "../GameState";
import { GamePhaseHandler } from "./GamePhaseHandler_base";

export class BootPhaseHandler extends GamePhaseHandler {
  private lcdBoot: LCDBootHandler;

  constructor(gameStore: GameStore, ui: Game_UI) {
    super(gameStore, ui);
    this.lcdBoot = new LCDBootHandler(ui);
  }

  protected async onEnter(): Promise<void> {
    await this.ui.setLayout("boot");
    await this.lcdBoot.executeBootSequence();

    
    //Transition message
    await this.ui.add_log(
      "Boot sequence complete. Ready for character creation...",
      60
    );
  }

  protected async render(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen("BOOT");

    /**
     * After boot animation
     * - display game intro (base story)
     * - update actions
     * - update phase title
     */
    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    )
  }

  protected async handleInput(): Promise<void> {
    await this.ui.add_log("\nPress any key to continue...", 30);
    await this.ui.waitForAnyKey();
  }

  protected async onExit(): Promise<void> {
    // set layout  (next phase)
   
    await this.ui.setLayout("character_creation");
    this.gameStore.setPhase("CHARACTER_CREATION");
  }

  //test
  async test() {
    this.onEnter();
  }
}
