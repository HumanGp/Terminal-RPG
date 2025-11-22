/**
'##::::'##:'##::::'##:'##::::'##::::'###::::'##::: ##::'######:::'########::'########:
 ##:::: ##: ##:::: ##: ###::'###:::'## ##::: ###:: ##:'##... ##:: ##.... ##:... ##..::
 ##:::: ##: ##:::: ##: ####'####::'##:. ##:: ####: ##: ##:::..::: ##:::: ##:::: ##::::
 #########: ##:::: ##: ## ### ##:'##:::. ##: ## ## ##: ##::'####: ########::::: ##::::
 ##.... ##: ##:::: ##: ##. #: ##: #########: ##. ####: ##::: ##:: ##.....:::::: ##::::
 ##:::: ##: ##:::: ##: ##:.:: ##: ##.... ##: ##:. ###: ##::: ##:: ##::::::::::: ##::::
 ##:::: ##:. #######:: ##:::: ##: ##:::: ##: ##::. ##:. ######::: ##::::::::::: ##::::
..:::::..:::.......:::..:::::..::..:::::..::..::::..:::......::::..::::::::::::..:::::
 */

import { Game_UI } from "../display/GameUI";
import { PhaseHandlerFactory } from "../state/phaseHandlers/GamePhaseHandler";
import { GameStore } from "../state/GameState";
import { layoutConfigs } from "../components/UI/ui";

class GAME {
  private gameStore: GameStore;
  private ui: Game_UI;
  private isRunning: boolean = false;

  constructor() {
    this.gameStore = new GameStore();
    this.ui = new Game_UI(layoutConfigs);
  }

  async start() {
    try {
      this.isRunning = true;

      // Subscribe to state changes
      const unsubscribe = this.gameStore.subscribe((state) => {
        this.onStateChange(state);
      });

      await this.run_game_loop();

      unsubscribe();
    } catch (error) {
      await this.ui.add_log(
        `Game error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      this.isRunning = false;
    }
  }

  private async run_game_loop() {
    while (this.isRunning) {
      const state = this.gameStore.getState();

      if (state.currentPhase === "GAME_OVER") {
        // Handle final game over state
        const handler = PhaseHandlerFactory.createHandler(
          "GAME_OVER",
          this.gameStore,
          this.ui
        );
        await handler.execute();
        break;
      }

      await this.executeCurrentPhase();
    }
  }

  private async executeCurrentPhase() {
    const state = this.gameStore.getState();

    try {
      const handler = PhaseHandlerFactory.createHandler(
        state.currentPhase,
        this.gameStore,
        this.ui
      );

      await handler.execute();
    } catch (error) {
      await this.ui.add_log(
        `Phase error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // Fallback to boot phase on error
      this.gameStore.setPhase("BOOT");
    }
  }

  private async onStateChange(state: any) {
    // React to specific state changes if needed
    // Example: When hero health reaches 0, trigger game over
    if (state.hero && state.hero.health <= 0) {
      this.gameStore.setPhase("GAME_OVER");
    }

    // Log state changes for debugging
    await this.ui.add_log(`State changed: ${state.currentPhase}`, 0);
  }
}


const game = new GAME();

game.start();
