import { Game_UI } from "../../display/GameUI";
import { Combat } from "../../game/combat";
import { GameStore } from "../GameState";
import { BootPhaseHandler } from "./BootHandler";
import { CharacterCreationPhaseHandler } from "./CharacterCreationPhaseHandler";
import { CombatPhaseHandler } from "./CombatPhaseHandler";
import { GameOverPhaseHandler } from "./GameOverHandler";
import { GamePhaseHandler } from "./GamePhaseHandler_base";
import { WorldMapPhaseHandler } from "./WorldMapPhaseHanlder";

// Phase Handler Factory
class PhaseHandlerFactory {
  static createHandler(phase: string, gameStore: GameStore, ui: Game_UI, combat?: Combat ): GamePhaseHandler {
    switch (phase) {
      case "BOOT":
        return new BootPhaseHandler(gameStore, ui);
      case "CHARACTER_CREATION":
        return new CharacterCreationPhaseHandler(gameStore, ui);
      case "WORLD_MAP":
        return new WorldMapPhaseHandler(gameStore, ui);
      case "COMBAT":
        return new CombatPhaseHandler(gameStore, ui, combat!);
      case "GAME_OVER":
        return new GameOverPhaseHandler(gameStore, ui);
      default:
        throw new Error(`Unknown phase: ${phase}`);
    }
  }
}

export {
  PhaseHandlerFactory,
  BootPhaseHandler,
  CharacterCreationPhaseHandler,
  WorldMapPhaseHandler,
  CombatPhaseHandler,
  GameOverPhaseHandler,
};
