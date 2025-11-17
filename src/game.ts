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

import { Game_UI } from "./display/GameUI";
import { PhaseHandlerFactory } from "./state/phaseHandlers/GamePhaseHandler";
import { GameStore } from "./state/GameState";

class GAME {
  private gameStore: GameStore;
  private ui: Game_UI;
  private isRunning: boolean = false;

  constructor() {
    this.gameStore = new GameStore();
    this.ui = new Game_UI();
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

// class PlatformerGame {
//   private world: WorldLevel;
//   private player: PlaybackDirection;
//   private cameraX: number = 0;
//   private isRunning: boolean = false;

//   constructor(private ui: Game_UI) {
//     this.world = WorldGenerator.generateLevel(1);
//     this.player = {
//       x: this.world.startPosition.x,
//       y: this.world.startPosition.y,
//       symbol: "☻",
//       health: 100,
//       facing: "right",
//       velocityY: 0,
//       isJumping: false,
//     };
//   }

//   async start(): Promise<void> {
//     this.isRunning = true;
//     await this.ui.setLayout("platformer");
//     await this.gameLoop();
//   }

//   private async gameLoop(): Promise<void> {
//     while (this.isRunning && this.player.health > 0) {
//       await this.handleInput();
//       this.updatePhysics();
//       this.updateCamera();
//       this.render();
//       await this.delay(50); // ~20 FPS
//     }

//     if (this.player.health <= 0) {
//       await this.gameOver();
//     }
//   }

//   private async handleInput(): Promise<void> {
//     return new Promise((resolve) => {
//       const handler = (ch: string, key: any) => {
//         const tileSize = 1;

//         if (key.name === "left") {
//           this.movePlayer(-1, 0);
//         } else if (key.name === "right") {
//           this.movePlayer(1, 0);
//         } else if (key.name === "up") {
//           this.jump();
//         } else if (key.name === "down") {
//           this.interact();
//         } else if (key.name === "space") {
//           this.shoot();
//         } else if (key.name === "q") {
//           this.isRunning = false;
//         }

//         this.ui.screen.removeListener("keypress", handler);
//         resolve();
//       };

//       this.ui.screen.once("keypress", handler);
//       setTimeout(resolve, 16); // Input timeout
//     });
//   }

//   private movePlayer(dx: number, dy: number): void {
//     const newX = this.player.x + dx;
//     const newY = this.player.y + dy;

//     // Check if new position is valid
//     if (this.isValidPosition(newX, newY)) {
//       this.player.x = newX;
//       this.player.y = newY;
//       this.player.facing =
//         dx > 0 ? "right" : dx < 0 ? "left" : this.player.facing;
//     }
//   }

//   private jump(): void {
//     if (!this.player.isJumping) {
//       this.player.velocityY = -3;
//       this.player.isJumping = true;
//     }
//   }

//   private shoot(): void {
//     // Create projectile
//     const projectile = {
//       x: this.player.x + (this.player.facing === "right" ? 1 : -1),
//       y: this.player.y,
//       dx: this.player.facing === "right" ? 2 : -2,
//       symbol: this.player.facing === "right" ? "→" : "←",
//     };

//     // Add to projectiles array and handle collision detection
//     this.handleProjectile(projectile);
//   }

//   private updatePhysics(): void {
//     // Gravity
//     this.player.velocityY += 0.5;

//     // Apply vertical movement
//     const newY = this.player.y + this.player.velocityY;
//     if (this.isValidPosition(this.player.x, newY)) {
//       this.player.y = newY;
//     } else {
//       // Hit ground or ceiling
//       this.player.velocityY = 0;
//       this.player.isJumping = false;
//     }

//     // Check for spikes or hazards
//     this.checkHazards();
//   }

//   private isValidPosition(x: number, y: number): boolean {
//     if (x < 0 || x >= this.world.width || y < 0 || y >= this.world.height) {
//       return false;
//     }

//     const tile = this.world.tiles[Math.floor(y)][Math.floor(x)];
//     return !tile.solid;
//   }

//   private checkHazards(): void {
//     const tile =
//       this.world.tiles[Math.floor(this.player.y)][Math.floor(this.player.x)];
//     if (tile.type === "spike") {
//       this.player.health -= 10;
//     }
//   }

//   private updateCamera(): void {
//     // Center camera on player, but don't show beyond world edges
//     const screenWidth = 40; // Terminal columns for game area
//     this.cameraX = Math.max(
//       0,
//       Math.min(this.player.x - screenWidth / 2, this.world.width - screenWidth)
//     );
//   }

//   private render(): void {
//     const screenWidth = 40;
//     const screenHeight = 20;
//     let display = "";

//     // Render visible portion of world
//     for (let y = 0; y < screenHeight; y++) {
//       for (let x = 0; x < screenWidth; x++) {
//         const worldX = Math.floor(this.cameraX + x);
//         const worldY = y;

//         let char = " ";
//         let color = "white";

//         // Draw world tiles
//         if (
//           worldX >= 0 &&
//           worldX < this.world.width &&
//           worldY >= 0 &&
//           worldY < this.world.height
//         ) {
//           const tile = this.world.tiles[worldY][worldX];
//           char = tile.symbol;
//           color = tile.color;
//         }

//         // Draw player
//         if (
//           Math.floor(this.player.x) === worldX &&
//           Math.floor(this.player.y) === worldY
//         ) {
//           char = this.player.symbol;
//           color = "cyan";
//         }

//         // Draw enemies
//         for (const enemy of this.world.enemies) {
//           if (
//             Math.floor(enemy.x) === worldX &&
//             Math.floor(enemy.y) === worldY
//           ) {
//             char = enemy.symbol;
//             color = "red";
//           }
//         }

//         display += `{${color}-fg}${char}{/}`;
//       }
//       display += "\n";
//     }

//     // Update UI
//     this.ui.update_game_area(display);
//     this.ui.update_actions([
//       `HEALTH: ${this.player.health}`,
//       `ARROW KEYS: Move`,
//       `SPACE: Shoot`,
//       `Q: Quit`,
//     ]);
//   }

//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   private async gameOver(): Promise<void> {
//     await this.ui.add_log("GAME OVER! Press any key...");
//     await this.ui.waitForAnyKey();
//   }
// }

const game = new GAME();
game.start();
