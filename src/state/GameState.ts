import { Character_Enemy, Character_Hero } from "../types/characters_types";
import { GameState } from "../types/game_types";
import { ARTS, GamePhase } from "../types/UI_types";

// Default initial state
const initialGameState: GameState = {
  currentPhase: "BOOT",
  hero: null,
  // enemy: null,
  currentArea: "FOREST_AREA",
  combatHistory: [],
  gameStats: {
    enemiesDefeated: 0,
    goldCollected: 0,
    areasExplored: 0,
  },
};

// Game Store class
class GameStore {
  private state: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor(initialState: GameState = initialGameState) {
    this.state = { ...initialState, };

  }

  // Get current state
  getState(): GameState {
    return { ...this.state };
  }

  // Update state
  setState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Subscribe to state changes
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Helper methods for common state updates
  setPhase(phase: GamePhase): void {
    this.setState({ currentPhase: phase });
  }

  setHero(hero: Character_Hero): void {
    this.setState({ hero });
  }

  // setEnemy(enemy: Character_Enemy): void {
  //   this.setState({ enemy });
  // }

  setArea(area: keyof ARTS): void {
    this.setState({ currentArea: area });
  }

  addCombatMessage(message: string): void {
    const combatHistory = [...this.state.combatHistory, message];
    this.setState({ combatHistory });
  }

  clearCombatHistory(): void {
    this.setState({ combatHistory: [] });
  }

  updateStats(stats: Partial<GameState["gameStats"]>): void {
    const gameStats = { ...this.state.gameStats, ...stats };
    this.setState({ gameStats });
  }

  // Reset game to initial state
  reset(): void {
    this.state = { ...initialGameState };
    this.notifyListeners();
  }
}

export { GameStore, initialGameState };
