// ********* combat phase handler ********

import { Game_UI } from "../../display/GameUI";
import { Combat } from "../../game/combat";
import { GameStore } from "../GameState";
import { GamePhaseHandler } from "./GamePhaseHandler_base";

export class CombatPhaseHandler extends GamePhaseHandler {
  private combat: Combat;

  constructor(gameStore: GameStore, ui: Game_UI, combat: Combat) {
    super(gameStore, ui);
    this.combat = combat;
  }

  protected async onEnter(): Promise<void> {
    const state = this.getState();
    this.gameStore.addCombatMessage(`Entering combat in ${state.currentArea}`);
  }

  protected async render(): Promise<void> {
    const state = this.getState();
    
    this.combat.start();

    await this.ui.add_log("Working on the combat", 0);
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
