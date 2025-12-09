var blessed = require("blessed"),
  contrib = require("blessed-contrib"),
  screen = blessed.screen()

// var grid = new contrib.grid({ rows: 1, cols: 2 });
// var grid1 = new contrib.grid({ rows: 1, cols: 2 });

// grid.set(0, 0, 1, 1, contrib.map, { label: "World Map" });
// grid1.set(0, 0, 1, 1, blessed.box, { content: "Box 1" });
// grid1.set(0, 1, 1, 1, blessed.box, { content: "Box 2" });

// grid.set(0, 1, 1, 1, grid1);
   
// grid.applyLayout(screen);


// // screen.append(line); //must append before setting data
// // line.setData(data.x, data.y);

// const grid = new contrib.grid({ rows: 12, cols: 12 , screen});

// grid.set(3, 0, 6, 12, blessed.box, {
//   top: 1, //Below title
//   left: 0,
//   width: "100%",
//   height: "70%",
//   content: "Welcome to your adventure...",
//   tags: true,
//   styles: {
//     fg: "#e8d8b5",
//     bg: "#2a1f1d",
//   },
//   border: {
//     type: "line",
//     fg: "#8b4513",
//   },
//   scrollable: true,
//   alwaysScroll: true,
//   scrollbar: {
//     ch: " ",
//     style: { bg: "#d4af37" },
//   },
//   padding: { left: 2, right: 2, top: 1, bottom: 1 },
//   label: "Screen",
// });


//  var map = grid.set(0, 0, 4, 4, contrib.map, { label: "World Map" });
// var box = grid.set(4, 4, 4, 4, contrib.donut, {
//   label: "Test",
//   radius: 8,
//   arcWidth: 3,
//   remainColor: "black",
//   yPadding: 2,
//   data: [{ percent: 80, label: "web1", color: "green" }],
// });


// grid.applyLayout(screen);

var map = contrib.map({
  label: 'World map'
})



screen.append(map);

screen.key(["escape", "q", "C-c"], function () {
  return process.exit(0);
});

screen.render();























/**
 * // Enhanced GameUI.ts
import { Widgets } from "blessed";
import type { Character_Enemy, Character_Hero } from "../types/characters_types";
import type { ASCII_Characters } from "../types/UI_types";
// ... your existing imports

class Game_UI {
  private screen!: Widgets.Screen;
  private gameArea!: Widgets.BoxElement;
  private textArea!: Widgets.BoxElement;
  private logArea!: Widgets.Log;
  private phaseTitle!: Widgets.Log;
  private inputArea!: Widgets.TextboxElement;
  private actionBar!: Widgets.BoxElement;
  private grid: any;
  private lcd: any;
  private heroPanel!: Widgets.BoxElement;
  private enemyPanel!: Widgets.BoxElement;
  private combatLog!: Widgets.Log;
  private healthGauge: any = null;
  private enemyHealthGauge: any = null;
  static ASCII: ASCII_Characters = ASCII;

  // Layout state
  private currentLayout: string = 'default';

  constructor() {
    this.initialize_standard_widgets();
    this.initialize_screen_events();
  }

  /*=======================================================*
   |                 LAYOUT MANAGEMENT                     |
   *=======================================================

  async setLayout(layoutName: string): Promise<void> {
    this.clear_game_area();
    
    switch(layoutName) {
      case 'boot':
        await this.setupBootLayout();
        break;
      case 'characterCreation':
        await this.setupCharacterCreationLayout();
        break;
      case 'worldMap':
        await this.setupWorldMapLayout();
        break;
      case 'combat':
        await this.setupCombatLayout();
        break;
      default:
        await this.setupDefaultLayout();
    }
    
    this.currentLayout = layoutName;
    this.screen.render();
  }

  private async setupBootLayout(): Promise<void> {
    // Center the LCD for boot sequence
    this.lcd.position = {
      top: 'center',
      left: 'center',
      width: '90%',
      height: 6
    };
    
    this.gameArea.append(this.lcd);
    this.textArea.hide();
    this.actionBar.hide();
    this.logArea.hide();
  }

  private async setupCharacterCreationLayout(): Promise<void> {
    // Show standard UI elements
    this.textArea.show();
    this.actionBar.show();
    this.logArea.show();
    
    // Position LCD at top, text area below
    this.lcd.position = {
      top: 1,
      left: 'center',
      width: '90%',
      height: 4
    };
    
    this.textArea.position = {
      top: 6,
      left: 0,
      width: '100%',
      height: '70%-6'
    };

    this.gameArea.append(this.lcd);
    this.gameArea.append(this.textArea);
    
    // Ensure text area is scrollable
    this.textArea.setScrollPerc(100);
  }

  private async setupWorldMapLayout(): Promise<void> {
    // Similar to character creation
    await this.setupCharacterCreationLayout();
  }

  private async setupCombatLayout(): Promise<void> {
    this.clear_game_area();
    
    // Create combat-specific layout using grid
    this.grid = require('blessed-contrib').grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });

    // Health gauges at top (row 0-1)
    this.healthGauge = this.grid.set(0, 0, 1, 6, contrib.gauge, {
      label: 'HERO HEALTH',
      stroke: 'green',
      fill: 'white',
      percent: 100
    });

    this.enemyHealthGauge = this.grid.set(0, 6, 1, 6, contrib.gauge, {
      label: 'ENEMY HEALTH', 
      stroke: 'red',
      fill: 'white',
      percent: 100
    });

    // Character panels (row 1-4)
    this.heroPanel = this.grid.set(1, 0, 3, 4, blessed.box, {
      label: ' {bold}HERO{/bold} ',
      tags: true,
      border: { type: 'line', fg: 'green' },
      style: { fg: 'white', bg: '#1f2a1f' },
      padding: { left: 1, right: 1 }
    });

    this.enemyPanel = this.grid.set(1, 8, 3, 4, blessed.box, {
      label: ' {bold}ENEMY{/bold} ',
      tags: true, 
      border: { type: 'line', fg: 'red' },
      style: { fg: 'white', bg: '#2a1f1f' },
      padding: { left: 1, right: 1 }
    });

    // Combat log (row 4-8)
    this.combatLog = this.grid.set(4, 0, 4, 12, blessed.log, {
      label: ' {bold}COMBAT LOG{/bold} ',
      tags: true,
      border: { type: 'line', fg: 'yellow' },
      style: { fg: 'white', bg: '#2a2a1f' },
      scrollable: true,
      scrollback: 100
    });

    // Action area (row 8-12)  
    this.textArea = this.grid.set(8, 0, 4, 12, blessed.box, {
      content: 'Choose your action...',
      tags: true,
      border: { type: 'line', fg: 'blue' },
      style: { fg: 'white', bg: '#1f2a2a' },
      padding: { left: 1, right: 1 }
    });

    this.gameArea.append(this.healthGauge);
    this.gameArea.append(this.enemyHealthGauge);
    this.gameArea.append(this.heroPanel);
    this.gameArea.append(this.enemyPanel);
    this.gameArea.append(this.combatLog);
    this.gameArea.append(this.textArea);
  }

  private async setupDefaultLayout(): Promise<void> {
    // Your original layout
    this.lcd.position = {
      top: 1,
      left: 'center', 
      width: '90%',
      height: 4
    };
    
    this.textArea.position = {
      top: 6,
      left: 0,
      width: '100%',
      height: '70%-6'
    };

    this.gameArea.append(this.lcd);
    this.gameArea.append(this.textArea);
    this.textArea.show();
  }

  /*=======================================================*
   |              IMPROVED LCD HANDLING                   |
   *=======================================================

  async type_lcd_message(message: string, speed: number = 100): Promise<void> {
    this.clear_lcd();
    
    // Handle long messages by splitting or truncating
    const maxLength = 16; // LCD character limit
    let displayMessage = message;
    
    if (message.length > maxLength) {
      // Option 1: Truncate with ellipsis
      displayMessage = message.substring(0, maxLength - 3) + '...';
      
      // Option 2: Scroll long messages (uncomment to use)
      // return this.scroll_long_message(message, speed);
    }

    for (let i = 0; i <= displayMessage.length; i++) {
      const displayText = displayMessage.substring(0, i).padEnd(maxLength, " ");
      this.set_lcd_display(displayText);
      await this.delay(speed);
    }
  }

  async scroll_long_message(message: string, speed: number = 150): Promise<void> {
    const maxLength = 16;
    const padding = ' '.repeat(maxLength);
    
    if (message.length <= maxLength) {
      return this.type_lcd_message(message, speed);
    }

    // Scroll the message through the display
    const fullMessage = padding + message + padding;
    
    for (let i = 0; i < fullMessage.length - maxLength + 1; i++) {
      const displayText = fullMessage.substring(i, i + maxLength);
      this.set_lcd_display(displayText);
      await this.delay(speed);
    }
  }

  // ... rest of your existing methods
}




// Enhanced phase handlers
class BootPhaseHandler {
  constructor(private gameStore: GameStore, private ui: Game_UI) {}

  async execute(): Promise<void> {
    // Set boot layout first
    await this.ui.setLayout('boot');
    
    const bootHandler = new LCDBootHandler(this.ui);
    await bootHandler.executeBootSequence();
    
    // Switch to character creation layout
    await this.ui.setLayout('characterCreation');
    this.gameStore.setPhase('CHARACTER_CREATION');
  }
}

class CombatPhaseHandler {
  constructor(private gameStore: GameStore, private ui: Game_UI) {}

  async execute(): Promise<void> {
    // Set combat layout
    await this.ui.setLayout('combat');
    
    const state = this.gameStore.getState();
    if (state.hero && state.enemy) {
      this.updateCombatDisplay(state.hero, state.enemy);
    }

    // Get player action
    const action = await this.ui.getInput('Choose action (ATTACK/DEFEND/RUN): ');
    // Handle combat logic...
  }

  private updateCombatDisplay(hero: Character_Hero, enemy: Character_Enemy): void {
    // Update health gauges
    this.ui.healthGauge.setPercent(hero.health);
    this.ui.enemyHealthGauge.setPercent(enemy.health);

    // Update character panels
    this.ui.heroPanel.setContent(
      `{bold}${hero.name}{/bold}\n` +
      `LVL: ${hero.level}\n` +
      `ATK: ${hero.attack}\n` + 
      `DEF: ${hero.defense}\n` +
      `HP: ${hero.health}%`
    );

    this.ui.enemyPanel.setContent(
      `{bold}${enemy.name}{/bold}\n` +
      `ATK: ${enemy.attack}\n` +
      `DEF: ${enemy.defense}\n` +
      `HP: ${enemy.health}%`
    );
  }
}


// ASCII combat characters utility
const ASCIICharacters = {
  hero: [
    "  O  ",
    " /|\\ ",
    " / \\ ",
    "     "
  ],
  enemy: [
    "  O  ",
    " /|\\ ",
    " / \\ ",
    "     "  
  ],
  boss: [
    " ▄▄▄ ",
    " ███ ",
    " ▀▀▀ ",
    "     "
  ]
};

class CombatRenderer {
  static renderCombatScene(hero: Character_Hero, enemy: Character_Enemy): string[] {
    const scene = [];
    
    // Health bars
    scene.push(`HERO: [${this.getHealthBar(hero.health)}] ${hero.health}%`);
    scene.push(`ENEMY: [${this.getHealthBar(enemy.health)}] ${enemy.health}%`);
    scene.push("");
    
    // ASCII characters facing each other
    const heroArt = ASCIICharacters.hero;
    const enemyArt = ASCIICharacters.enemy;
    
    for (let i = 0; i < Math.max(heroArt.length, enemyArt.length); i++) {
      const heroLine = heroArt[i] || "     ";
      const enemyLine = enemyArt[i] || "     ";
      scene.push(`${heroLine}   VS   ${enemyLine}`);
    }
    
    return scene;
  }

  private static getHealthBar(health: number): string {
    const bars = Math.floor(health / 10);
    return '█'.repeat(bars) + '░'.repeat(10 - bars);
  }
}

// In your main game.ts
private async executeCurrentPhase() {
  const state = this.gameStore.getState();

  try {
    const handler = PhaseHandlerFactory.createHandler(
      state.currentPhase,
      this.gameStore,
      this.ui
    );

    // The handler will now automatically set the appropriate layout
    await handler.execute();
  } catch (error) {
    await this.ui.add_log(`Phase error: ${error instanceof Error ? error.message : "Unknown error"}`);
    this.gameStore.setPhase("BOOT");
  }
}




// Brick game
// BrickGame.ts - Main game class
import { Game_UI } from "./GameUI";

interface Brick {
    x: number;
    y: number;
    width: number;
    health: number;
    color: string;
}

interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    symbol: string;
}

class BrickGame {
    private ui: Game_UI;
    private isRunning: boolean = false;
    
    // Game state
    private paddle: { x: number; width: number } = { x: 10, width: 6 };
    private ball: Ball = { x: 15, y: 10, dx: 1, dy: -1, symbol: '●' };
    private bricks: Brick[] = [];
    private score: number = 0;
    private lives: number = 3;
    private level: number = 1;

    constructor() {
        this.ui = new Game_UI();
        this.initializeBricks();
    }

    async start() {
        this.isRunning = true;
        await this.ui.setLayout('brickGame');
        await this.gameLoop();
    }

    private initializeBricks(): void {
        this.bricks = [];
        const rows = 4;
        const cols = 10;
        const brickWidth = 3;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: col * (brickWidth + 1),
                    y: row + 2,
                    width: brickWidth,
                    health: 1,
                    color: ['red', 'green', 'yellow', 'blue'][row]
                });
            }
        }
    }

    private async gameLoop(): Promise<void> {
        while (this.isRunning && this.lives > 0) {
            this.update();
            this.render();
            
            // Handle input
            await this.handleInput();
            
            // Small delay for game speed
            await this.delay(100);
        }

        // Game over
        await this.showGameOver();
    }

    private update(): void {
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Wall collisions
        if (this.ball.x <= 0 || this.ball.x >= 39) {
            this.ball.dx *= -1;
        }
        if (this.ball.y <= 0) {
            this.ball.dy *= -1;
        }

        // Paddle collision
        if (this.ball.y >= 18 && 
            this.ball.x >= this.paddle.x && 
            this.ball.x <= this.paddle.x + this.paddle.width) {
            this.ball.dy *= -1;
            // Add some horizontal direction based on where ball hits paddle
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.dx = (hitPos - 0.5) * 2;
        }

        // Bottom boundary (lose life)
        if (this.ball.y > 20) {
            this.lives--;
            if (this.lives > 0) {
                this.resetBall();
            }
        }

        // Brick collisions
        this.checkBrickCollisions();
    }

    private checkBrickCollisions(): void {
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            
            if (this.ball.y === brick.y && 
                this.ball.x >= brick.x && 
                this.ball.x <= brick.x + brick.width) {
                
                this.ball.dy *= -1;
                brick.health--;
                
                if (brick.health <= 0) {
                    this.bricks.splice(i, 1);
                    this.score += 10;
                }
                
                // Level complete
                if (this.bricks.length === 0) {
                    this.level++;
                    this.initializeBricks();
                    this.resetBall();
                }
                break;
            }
        }
    }

    private resetBall(): void {
        this.ball.x = 15;
        this.ball.y = 10;
        this.ball.dx = Math.random() > 0.5 ? 1 : -1;
        this.ball.dy = -1;
    }

    private async handleInput(): Promise<void> {
        // Non-blocking input check
        return new Promise((resolve) => {
            const handler = (ch: string, key: any) => {
                if (key.name === 'left' && this.paddle.x > 0) {
                    this.paddle.x -= 2;
                } else if (key.name === 'right' && this.paddle.x < 34) {
                    this.paddle.x += 2;
                } else if (key.name === 'q') {
                    this.isRunning = false;
                }
                
                this.ui.screen.removeListener('keypress', handler);
                resolve();
            };
            
            this.ui.screen.once('keypress', handler);
            setTimeout(resolve, 50); // Timeout if no input
        });
    }

    private render(): void {
        const gameWidth = 40;
        const gameHeight = 20;
        let display = '';

        // Create game frame
        for (let y = 0; y < gameHeight; y++) {
            for (let x = 0; x < gameWidth; x++) {
                let char = ' ';

                // Draw walls
                if (y === 0 || x === 0 || x === gameWidth - 1) {
                    char = '█';
                }
                // Draw paddle
                else if (y === gameHeight - 2 && x >= this.paddle.x && x < this.paddle.x + this.paddle.width) {
                    char = '═';
                }
                // Draw ball
                else if (y === Math.floor(this.ball.y) && x === Math.floor(this.ball.x)) {
                    char = this.ball.symbol;
                }
                // Draw bricks
                else {
                    const brick = this.bricks.find(b => 
                        y === b.y && x >= b.x && x < b.x + b.width
                    );
                    if (brick) {
                        char = '▓';
                    }
                }

                display += char;
            }
            display += '\n';
        }

        // Update UI
        this.ui.update_game_area(display);
        this.ui.update_actions([
            `SCORE: ${this.score}`,
            `LIVES: ${this.lives}`,
            `LEVEL: ${this.level}`,
            `CONTROLS: ← → arrows, Q to quit`
        ]);
    }

    private async showGameOver(): Promise<void> {
        const message = this.lives > 0 ? 
            `🎉 YOU WIN! Final Score: ${this.score}` : 
            `💀 GAME OVER! Final Score: ${this.score}`;
            
        await this.ui.add_log(message);
        await this.ui.add_log("Press any key to exit...");
        await this.ui.waitForAnyKey();
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}



// Enhanced GameUI.ts - Brick Game Version
class Game_UI {
    // ... your existing properties

    async setLayout(layoutName: string): Promise<void> {
        this.clear_game_area();
        
        if (layoutName === 'brickGame') {
            await this.setupBrickGameLayout();
        } else {
            await this.setupDefaultLayout();
        }
        
        this.screen.render();
    }

    private async setupBrickGameLayout(): Promise<void> {
        // Simple layout for brick game
        this.textArea.position = {
            top: 1,
            left: 'center',
            width: '80%',
            height: '80%'
        };
        
        this.actionBar.position = {
            top: '85%',
            left: 0,
            width: '100%',
            height: 3
        };
        
        this.logArea.position = {
            top: '90%', 
            left: 0,
            width: '100%',
            height: '10%'
        };

        this.gameArea.append(this.textArea);
        this.textArea.show();
        this.actionBar.show();
        this.logArea.show();
        this.lcd.hide(); // We don't need LCD for brick game
    }

    // Keep your existing methods...
}



// game.ts - Simplified
import { BrickGame } from "./BrickGame";

class Game {
    async start() {
        try {
            const brickGame = new BrickGame();
            await brickGame.start();
        } catch (error) {
            console.error('Game error:', error);
        } finally {
            process.exit(0);
        }
    }
}

const game = new Game();
game.start();


// Power-ups and advanced features
interface PowerUp {
    x: number;
    y: number;
    type: 'expand' | 'shrink' | 'multiball' | 'slow';
    symbol: string;
}

class AdvancedBrickGame extends BrickGame {
    private powerUps: PowerUp[] = [];
    private balls: Ball[] = [];

    // Override update method for power-ups
    protected update(): void {
        super.update();
        this.updatePowerUps();
        this.updateMultipleBalls();
    }

    private updatePowerUps(): void {
        // Move power-ups down
        this.powerUps.forEach(powerUp => {
            powerUp.y += 0.5;
            
            // Paddle collision with power-up
            if (powerUp.y >= 18 && 
                powerUp.x >= this.paddle.x && 
                powerUp.x <= this.paddle.x + this.paddle.width) {
                this.activatePowerUp(powerUp);
            }
        });
        
        // Remove off-screen power-ups
        this.powerUps = this.powerUps.filter(p => p.y < 20);
    }

    private activatePowerUp(powerUp: PowerUp): void {
        switch(powerUp.type) {
            case 'expand':
                this.paddle.width = Math.min(10, this.paddle.width + 2);
                break;
            case 'shrink':
                this.paddle.width = Math.max(3, this.paddle.width - 1);
                break;
            case 'multiball':
                this.balls.push({
                    x: this.paddle.x + this.paddle.width / 2,
                    y: 17,
                    dx: -1,
                    dy: -1,
                    symbol: '○'
                });
                break;
            case 'slow':
                // Slow down all balls
                this.balls.forEach(ball => {
                    ball.dx *= 0.7;
                    ball.dy *= 0.7;
                });
                break;
        }
    }
}


|MAIN GAME|

// WorldGenerator.ts
class WorldGenerator {
    static generateLevel(level: number): WorldLevel {
        const width = 80;
        const height = 20;
        const tiles: WorldTile[][] = [];
        
        // Initialize empty world
        for (let y = 0; y < height; y++) {
            tiles[y] = [];
            for (let x = 0; x < width; x++) {
                tiles[y][x] = { symbol: ' ', color: 'white', solid: false, type: 'empty' };
            }
        }
        
        // Generate terrain based on level theme
        switch (level) {
            case 1:
                this.generateForestLevel(tiles, width, height);
                break;
            case 2:
                this.generateFactoryLevel(tiles, width, height);
                break;
            case 3:
                this.generateBaseLevel(tiles, width, height);
                break;
        }
        
        return {
            width,
            height,
            tiles,
            enemies: this.generateEnemies(level, tiles),
            items: this.generateItems(level),
            startPosition: { x: 2, y: height - 3 },
            endPosition: { x: width - 2, y: height - 3 }
        };
    }
    
    private static generateForestLevel(tiles: WorldTile[][], width: number, height: number): void {
        // Ground
        for (let x = 0; x < width; x++) {
            tiles[height - 1][x] = { symbol: '█', color: 'green', solid: true, type: 'ground' };
            tiles[height - 2][x] = { symbol: '▒', color: 'green', solid: true, type: 'ground' };
        }
        
        // Platforms
        this.createPlatform(tiles, 10, height - 4, 5);
        this.createPlatform(tiles, 20, height - 6, 4);
        this.createPlatform(tiles, 30, height - 8, 6);
        this.createPlatform(tiles, 45, height - 5, 3);
        
        // Trees/obstacles
        for (let x = 15; x < 18; x++) {
            tiles[height - 3][x] = { symbol: '▓', color: 'brown', solid: true, type: 'wall' };
        }
        
        // Ladders
        this.createLadder(tiles, 25, height - 8, 4);
    }
    
    private static generateFactoryLevel(tiles: WorldTile[][], width: number, height: number): void {
        // Metal floor
        for (let x = 0; x < width; x++) {
            tiles[height - 1][x] = { symbol: '═', color: 'gray', solid: true, type: 'ground' };
        }
        
        // Platforms and machinery
        this.createPlatform(tiles, 5, height - 3, 8, '═', 'gray');
        this.createPlatform(tiles, 18, height - 5, 6, '═', 'gray');
        this.createPlatform(tiles, 30, height - 7, 4, '═', 'gray');
        
        // Conveyor belts, pipes, etc.
        this.createPipe(tiles, 12, height - 4, 3);
        this.createSpikes(tiles, 40, height - 1, 5);
    }
    
    private static createPlatform(tiles: WorldTile[][], startX: number, y: number, length: number, symbol: string = '─', color: string = 'yellow'): void {
        for (let x = startX; x < startX + length; x++) {
            tiles[y][x] = { symbol, color, solid: true, type: 'platform' };
        }
    }
    
    private static createLadder(tiles: WorldTile[][], x: number, startY: number, height: number): void {
        for (let y = startY; y < startY + height; y++) {
            tiles[y][x] = { symbol: 'H', color: 'brown', solid: false, type: 'ladder' };
        }
    }
    
    private static createPipe(tiles: WorldTile[][], x: number, startY: number, height: number): void {
        for (let y = startY; y > startY - height; y--) {
            tiles[y][x] = { symbol: '│', color: 'gray', solid: true, type: 'wall' };
        }
    }
    
    private static createSpikes(tiles: WorldTile[][], startX: number, y: number, count: number): void {
        for (let x = startX; x < startX + count; x++) {
            tiles[y][x] = { symbol: '▲', color: 'red', solid: false, type: 'spike' };
        }
    }
}



// PlatformerGame.ts
class PlatformerGame {
    private world: WorldLevel;
    private player: Player;
    private cameraX: number = 0;
    private isRunning: boolean = false;
    
    constructor(private ui: Game_UI) {
        this.world = WorldGenerator.generateLevel(1);
        this.player = {
            x: this.world.startPosition.x,
            y: this.world.startPosition.y,
            symbol: '☻',
            health: 100,
            facing: 'right',
            velocityY: 0,
            isJumping: false
        };
    }
    
    async start(): Promise<void> {
        this.isRunning = true;
        await this.ui.setLayout('platformer');
        await this.gameLoop();
    }
    
    private async gameLoop(): Promise<void> {
        while (this.isRunning && this.player.health > 0) {
            await this.handleInput();
            this.updatePhysics();
            this.updateCamera();
            this.render();
            await this.delay(50); // ~20 FPS
        }
        
        if (this.player.health <= 0) {
            await this.gameOver();
        }
    }
    
    private async handleInput(): Promise<void> {
        return new Promise((resolve) => {
            const handler = (ch: string, key: any) => {
                const tileSize = 1;
                
                if (key.name === 'left') {
                    this.movePlayer(-1, 0);
                } else if (key.name === 'right') {
                    this.movePlayer(1, 0);
                } else if (key.name === 'up') {
                    this.jump();
                } else if (key.name === 'down') {
                    this.interact();
                } else if (key.name === 'space') {
                    this.shoot();
                } else if (key.name === 'q') {
                    this.isRunning = false;
                }
                
                this.ui.screen.removeListener('keypress', handler);
                resolve();
            };
            
            this.ui.screen.once('keypress', handler);
            setTimeout(resolve, 16); // Input timeout
        });
    }
    
    private movePlayer(dx: number, dy: number): void {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // Check if new position is valid
        if (this.isValidPosition(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.player.facing = dx > 0 ? 'right' : dx < 0 ? 'left' : this.player.facing;
        }
    }
    
    private jump(): void {
        if (!this.player.isJumping) {
            this.player.velocityY = -3;
            this.player.isJumping = true;
        }
    }
    
    private shoot(): void {
        // Create projectile
        const projectile = {
            x: this.player.x + (this.player.facing === 'right' ? 1 : -1),
            y: this.player.y,
            dx: this.player.facing === 'right' ? 2 : -2,
            symbol: this.player.facing === 'right' ? '→' : '←'
        };
        
        // Add to projectiles array and handle collision detection
        this.handleProjectile(projectile);
    }
    
    private updatePhysics(): void {
        // Gravity
        this.player.velocityY += 0.5;
        
        // Apply vertical movement
        const newY = this.player.y + this.player.velocityY;
        if (this.isValidPosition(this.player.x, newY)) {
            this.player.y = newY;
        } else {
            // Hit ground or ceiling
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // Check for spikes or hazards
        this.checkHazards();
    }
    
    private isValidPosition(x: number, y: number): boolean {
        if (x < 0 || x >= this.world.width || y < 0 || y >= this.world.height) {
            return false;
        }
        
        const tile = this.world.tiles[Math.floor(y)][Math.floor(x)];
        return !tile.solid;
    }
    
    private checkHazards(): void {
        const tile = this.world.tiles[Math.floor(this.player.y)][Math.floor(this.player.x)];
        if (tile.type === 'spike') {
            this.player.health -= 10;
        }
    }
    
    private updateCamera(): void {
        // Center camera on player, but don't show beyond world edges
        const screenWidth = 40; // Terminal columns for game area
        this.cameraX = Math.max(0, Math.min(
            this.player.x - screenWidth / 2,
            this.world.width - screenWidth
        ));
    }
    
    private render(): void {
        const screenWidth = 40;
        const screenHeight = 20;
        let display = '';
        
        // Render visible portion of world
        for (let y = 0; y < screenHeight; y++) {
            for (let x = 0; x < screenWidth; x++) {
                const worldX = Math.floor(this.cameraX + x);
                const worldY = y;
                
                let char = ' ';
                let color = 'white';
                
                // Draw world tiles
                if (worldX >= 0 && worldX < this.world.width && worldY >= 0 && worldY < this.world.height) {
                    const tile = this.world.tiles[worldY][worldX];
                    char = tile.symbol;
                    color = tile.color;
                }
                
                // Draw player
                if (Math.floor(this.player.x) === worldX && Math.floor(this.player.y) === worldY) {
                    char = this.player.symbol;
                    color = 'cyan';
                }
                
                // Draw enemies
                for (const enemy of this.world.enemies) {
                    if (Math.floor(enemy.x) === worldX && Math.floor(enemy.y) === worldY) {
                        char = enemy.symbol;
                        color = 'red';
                    }
                }
                
                display += `{${color}-fg}${char}{/}`;
            }
            display += '\n';
        }
        
        // Update UI
        this.ui.update_game_area(display);
        this.ui.update_actions([
            `HEALTH: ${this.player.health}`,
            `ARROW KEYS: Move`,
            `SPACE: Shoot`,
            `Q: Quit`
        ]);
    }
    
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    private async gameOver(): Promise<void> {
        await this.ui.add_log("GAME OVER! Press any key...");
        await this.ui.waitForAnyKey();
    }
}





// In GameUI.ts - Add platformer layout
private async setupPlatformerLayout(): Promise<void> {
    this.textArea.position = {
        top: 1,
        left: 'center',
        width: 42, // Fixed width for game area
        height: 22, // Fixed height
        border: { type: 'line', fg: 'blue' }
    };
    
    this.actionBar.position = {
        top: 24,
        left: 0,
        width: '100%',
        height: 3
    };
    
    this.logArea.position = {
        top: 28,
        left: 0,
        width: '100%',
        height: '10%'
    };

    this.gameArea.append(this.textArea);
    this.textArea.show();
    this.actionBar.show();
    this.logArea.show();
    this.lcd.hide();
}


// Enemy.ts
interface Enemy {
    x: number;
    y: number;
    symbol: string;
    health: number;
    type: 'patrol' | 'shooter' | 'boss';
    patrolRange: number;
    direction: number;
}

class EnemyAI {
    static updateEnemy(enemy: Enemy, player: Player, world: WorldLevel): void {
        switch (enemy.type) {
            case 'patrol':
                this.patrolBehavior(enemy, world);
                break;
            case 'shooter':
                this.shooterBehavior(enemy, player);
                break;
        }
    }
    
    private static patrolBehavior(enemy: Enemy, world: WorldLevel): void {
        const newX = enemy.x + enemy.direction;
        
        if (!world.tiles[Math.floor(enemy.y)][Math.floor(newX)]?.solid) {
            enemy.x = newX;
        } else {
            enemy.direction *= -1;
        }
    }
    
    private static shooterBehavior(enemy: Enemy, player: Player): void {
        // Simple shooting logic - could shoot projectiles at player
        if (Math.abs(enemy.x - player.x) < 10) {
            // Enemy would shoot here
        }
    }
}



ANSI

// CharacterArtLoader.ts
import * as fs from 'fs';
import * as path from 'path';

class CharacterArtLoader {
    private characterArt: Map<string, string[]> = new Map();

    loadCharacterArt(filePath: string): void {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            this.parseCharacterArt(data);
        } catch (error) {
            console.error('Error loading character art:', error);
        }
    }

    private parseCharacterArt(data: string): void {
        const lines = data.split('\n');
        let currentCharacter: string | null = null;
        let currentArt: string[] = [];

        for (const line of lines) {
            // Check if line is a character name/identifier
            if (line.match(/^[A-Z_]+:$/) || line.match(/^\[.*\]$/)) {
                // Save previous character art
                if (currentCharacter && currentArt.length > 0) {
                    this.characterArt.set(currentCharacter, [...currentArt]);
                }
                
                // Start new character
                currentCharacter = line.replace(/[:\[\]]/g, '').trim();
                currentArt = [];
            } else if (currentCharacter && line.trim()) {
                // Add to current character's art
                currentArt.push(line);
            }
        }

        // Don't forget the last character
        if (currentCharacter && currentArt.length > 0) {
            this.characterArt.set(currentCharacter, [...currentArt]);
        }
    }

    getCharacterArt(characterName: string): string[] | null {
        return this.characterArt.get(characterName) || null;
    }

    getAllCharacterNames(): string[] {
        return Array.from(this.characterArt.keys());
    }
}




// ANSIPlatformerGame.ts
class ANSIPlatformerGame {
    private world: WorldLevel;
    private player: Player;
    private cameraX: number = 0;
    private isRunning: boolean = false;
    private artLoader: CharacterArtLoader;

    constructor(private ui: Game_UI) {
        this.artLoader = new CharacterArtLoader();
        this.artLoader.loadCharacterArt('./characterANSI.txt');
        
        this.world = WorldGenerator.generateLevel(1);
        this.player = {
            x: this.world.startPosition.x,
            y: this.world.startPosition.y,
            symbol: '☻', // fallback
            health: 100,
            facing: 'right',
            velocityY: 0,
            isJumping: false
        };
    }

    private render(): void {
        const screenWidth = 40;
        const screenHeight = 20;
        let display = '';
        
        // Get player art if available
        const playerArt = this.artLoader.getCharacterArt('HERO') || 
                         this.artLoader.getCharacterArt('PLAYER') || [this.player.symbol];

        // Render visible portion of world
        for (let y = 0; y < screenHeight; y++) {
            for (let x = 0; x < screenWidth; x++) {
                const worldX = Math.floor(this.cameraX + x);
                const worldY = y;
                
                let char = ' ';
                let color = 'white';
                
                // Draw world tiles
                if (worldX >= 0 && worldX < this.world.width && worldY >= 0 && worldY < this.world.height) {
                    const tile = this.world.tiles[worldY][worldX];
                    char = tile.symbol;
                    color = tile.color;
                }

                // Draw player using ANSI art
                if (this.isPlayerAt(worldX, worldY)) {
                    const artLine = this.getPlayerArtLine(y - Math.floor(this.player.y), playerArt);
                    if (artLine && x - (this.player.x - this.cameraX) < artLine.length) {
                        const artX = x - (this.player.x - this.cameraX);
                        if (artX >= 0 && artX < artLine.length) {
                            char = artLine[artX] || ' ';
                            color = 'cyan';
                        }
                    }
                }

                // Draw enemies with their ANSI art
                const enemy = this.getEnemyAt(worldX, worldY);
                if (enemy) {
                    const enemyArt = this.artLoader.getCharacterArt(enemy.type.toUpperCase()) || [enemy.symbol];
                    const artLine = this.getArtLine(y - Math.floor(enemy.y), enemyArt, enemyArt.length);
                    if (artLine && x - (enemy.x - this.cameraX) < artLine.length) {
                        const artX = x - (enemy.x - this.cameraX);
                        if (artX >= 0 && artX < artLine.length) {
                            char = artLine[artX] || ' ';
                            color = 'red';
                        }
                    }
                }
                
                display += `{${color}-fg}${char}{/}`;
            }
            display += '\n';
        }
        
        this.ui.update_game_area(display);
        this.ui.update_actions([
            `HEALTH: ${this.player.health}`,
            `ARROWS: Move  SPACE: Shoot`,
            `Q: Quit`
        ]);
    }

    private isPlayerAt(worldX: number, worldY: number): boolean {
        const playerArt = this.artLoader.getCharacterArt('HERO') || [this.player.symbol];
        const artWidth = playerArt[0]?.length || 1;
        const artHeight = playerArt.length;
        
        return worldX >= this.player.x && 
               worldX < this.player.x + artWidth &&
               worldY >= this.player.y && 
               worldY < this.player.y + artHeight;
    }

    private getPlayerArtLine(relativeY: number, art: string[]): string | null {
        if (relativeY >= 0 && relativeY < art.length) {
            return art[relativeY];
        }
        return null;
    }

    private getArtLine(relativeY: number, art: string[], maxHeight: number): string | null {
        if (relativeY >= 0 && relativeY < art.length && relativeY < maxHeight) {
            return art[relativeY];
        }
        return null;
    }

    private getEnemyAt(worldX: number, worldY: number): Enemy | null {
        for (const enemy of this.world.enemies) {
            const enemyArt = this.artLoader.getCharacterArt(enemy.type.toUpperCase()) || [enemy.symbol];
            const artWidth = enemyArt[0]?.length || 1;
            const artHeight = enemyArt.length;
            
            if (worldX >= enemy.x && 
                worldX < enemy.x + artWidth &&
                worldY >= enemy.y && 
                worldY < enemy.y + artHeight) {
                return enemy;
            }
        }
        return null;
    }
}


// ANSICombatHandler.ts
class ANSICombatHandler {
    async executeCombat(hero: Character_Hero, enemy: Character_Enemy, ui: Game_UI, artLoader: CharacterArtLoader): Promise<'VICTORY' | 'DEFEAT'> {
        await ui.setLayout('combat');
        
        const heroArt = artLoader.getCharacterArt('HERO') || ['[H]'];
        const enemyArt = artLoader.getCharacterArt(enemy.type.toUpperCase()) || ['[E]'];
        
        // Render combat scene with ANSI art
        this.renderCombatScene(ui, heroArt, enemyArt, hero, enemy);
        
        // Combat logic here...
        return await this.combatLoop(ui, hero, enemy);
    }

    private renderCombatScene(ui: Game_UI, heroArt: string[], enemyArt: string[], hero: Character_Hero, enemy: Character_Enemy): void {
        const combatDisplay = this.createCombatDisplay(heroArt, enemyArt, hero, enemy);
        ui.update_game_area(combatDisplay.join('\n'));
    }

    private createCombatDisplay(heroArt: string[], enemyArt: string[], hero: Character_Hero, enemy: Character_Enemy): string[] {
        const display: string[] = [];
        const maxHeight = Math.max(heroArt.length, enemyArt.length, 10);
        
        for (let y = 0; y < maxHeight; y++) {
            let line = '';
            
            // Hero side
            if (y < heroArt.length) {
                line += heroArt[y].padEnd(20, ' ');
            } else {
                line += ' '.repeat(20);
            }
            
            // VS separator
            line += '   VS   ';
            
            // Enemy side  
            if (y < enemyArt.length) {
                line += enemyArt[y];
            }
            
            display.push(line);
        }
        
        // Add health bars
        display.push('');
        display.push(`HERO: [${this.getHealthBar(hero.health)}] ${hero.health}%`);
        display.push(`ENEMY: [${this.getHealthBar(enemy.health)}] ${enemy.health}%`);
        
        return display;
    }

    private getHealthBar(health: number): string {
        const bars = Math.floor(health / 10);
        return '█'.repeat(bars) + '░'.repeat(10 - bars);
    }
}

// Test your character art
const artLoader = new CharacterArtLoader();
artLoader.loadCharacterArt('./characterANSI.txt');

console.log('Available characters:', artLoader.getAllCharacterNames());

// Test a specific character
const heroArt = artLoader.getCharacterArt('HERO');
if (heroArt) {
    console.log('Hero art:');
    heroArt.forEach(line => console.log(line));
} else {
    console.log('No hero art found. Available:', artLoader.getAllCharacterNames());
}
 */

