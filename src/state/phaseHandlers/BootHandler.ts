// ************** Boot Phase Handler ***************

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
    // Set boot layout
    await this.ui.setLayout("boot");
    // LCD for boot sequence
    await this.lcdBoot.executeBootSequence();

    //Transition message
    await this.ui.add_log(
      "Boot sequence complete. Ready for character creation...",
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
    // set layout  (next phase)
    await this.ui.setLayout("characterCreation");
    this.gameStore.setPhase("CHARACTER_CREATION");
  }

  //test
  async test() {
    this.onEnter();
  }
}
