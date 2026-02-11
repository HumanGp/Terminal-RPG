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
import { WorldLevel, Enemy, Projectile, Tile } from "../types/combat_types";
import { Player } from "../components/characters/Player";
import { Player as PlayerInstance } from "../types/combat_types";

/*=======================================================*
 |                  COMBAT PHYSICS                       |
 *=======================================================*/

export class Combat {
  // singleton instance
  private static instance: Combat | null = null;

  private world: WorldLevel;
  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private cameraX: number = 0;
  private isRunning: boolean = false;
  private ui: Game_UI;
  private combatResult: { victory: boolean; goldReward: number } = {
    victory: false,
    goldReward: 0,
  };
  private keysPressed: Set<string> = new Set();
  private gravity: number = 0.5;
  private moveSpeed: number = 1.5;
  private jumpForce: number = -8;

  private constructor() {
    this.ui = Game_UI.getInstance();
    this.world = WorldGenerator.generateLevel(1);
    this.player = Player.getInstance(this.world.startPosition);
    this.enemies = this.world.enemies;
    this.cameraX = 0;
    this.isRunning = false;

    this.setupInputHandling();
  }

  public static getInstance() {
    if (!Combat.instance) {
      Combat.instance = new Combat();
    }
    return Combat.instance;
  }

  private setupInputHandling(): void {
    // Continuous key press handling for smooth movement
    this.ui.screen.on("keypress", (ch: string, key: any) => {
      if (key.name === "left") {
        this.keysPressed.add("left");
      } else if (key.name === "right") {
        this.keysPressed.add("right");
      } else if (key.name === "up" || key.name === "space") {
        this.keysPressed.add("jump");
      } else if (key.name === "z" || key.name === "x") {
        this.keysPressed.add("attack");
      }
    });

    // Key release handling
    this.ui.screen.on("keyup", (ch: string, key: any) => {
      if (key.name === "left") {
        this.keysPressed.delete("left");
      } else if (key.name === "right") {
        this.keysPressed.delete("right");
      } else if (key.name === "up" || key.name === "space") {
        this.keysPressed.delete("jump");
      } else if (key.name === "z" || key.name === "x") {
        this.keysPressed.delete("attack");
      }
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;

    // Set up combat layout
    await this.ui.setLayout("combat");
    await this.ui.add_log(
      "Combat started! Use ARROWS to move, SPACE to jump, Z to attack!",
      0
    );

    await this.gameLoop();
  }

  getResult(): { victory: boolean; goldReward: number } {
    return this.combatResult;
  }

  private async gameLoop(): Promise<void> {
    while (
      this.isRunning &&
      this.player.health > 0 &&
      this.enemies.length > 0
    ) {
      const startTime = Date.now();

      // Handle continuous input
      this.handleContinuousInput();

      // Update game state
      this.updatePhysics();
      this.updateEnemies();
      this.updateProjectiles();
      this.updateCamera();
      this.checkCollisions();

      // Render
      this.render();

      // Frame rate control (60 FPS)
      const frameTime = Date.now() - startTime;
      await this.delay(Math.max(0, 16 - frameTime));
    }

    // Combat ended
    if (this.player.health <= 0) {
      this.combatResult = { victory: false, goldReward: 0 };
      await this.ui.add_log("You were defeated in combat...");
    } else if (this.enemies.length === 0) {
      this.combatResult = { victory: true, goldReward: 50 };
      await this.ui.add_log("Victory! All enemies defeated!");
    }
  }

  private handleContinuousInput(): void {
    // Horizontal movement
    this.player.velocityX = 0;

    if (this.keysPressed.has("left")) {
      this.player.velocityX = -this.moveSpeed;
      this.player.facing = "left";
    }
    if (this.keysPressed.has("right")) {
      this.player.velocityX = this.moveSpeed;
      this.player.facing = "right";
    }

    // Jumping
    if (this.keysPressed.has("jump") && !this.player.isJumping) {
      this.player.velocityY = this.jumpForce;
      this.player.isJumping = true;
    }

    // Attacking
    if (this.keysPressed.has("attack") && this.player.attackCooldown <= 0) {
      this.attack();
      this.player.attackCooldown = 20; // Cooldown frames
    }

    // Update cooldowns
    if (this.player.attackCooldown > 0) {
      this.player.attackCooldown--;
    }
  }

  private attack(): void {
    // Create melee attack hitbox or projectile based on facing direction
    const attackX = this.player.x + (this.player.facing === "right" ? 1 : -1);
    const attackY = this.player.y;

    // Check for enemy hits
    for (const enemy of this.enemies) {
      if (this.distance(attackX, attackY, enemy.x, enemy.y) < 1.5) {
        enemy.health -= this.player.attack;
        this.ui.add_log(
          `You hit the enemy for ${this.player.attack} damage!`,
          0
        );

        if (enemy.health <= 0) {
          this.enemies = this.enemies.filter((e) => e !== enemy);
          this.ui.add_log("Enemy defeated!", 0);
        }
      }
    }

    // Visual feedback for attack
    this.projectiles.push({
      x: attackX,
      y: attackY,
      dx: 0,
      dy: 0,
      symbol: this.player.facing === "right" ? "→" : "←",
      damage: this.player.attack,
      isPlayerProjectile: true,
    });
  }

  private updatePhysics(): void {
    // Apply gravity
    this.player.velocityY += this.gravity;

    // Apply horizontal movement with collision
    const newX = this.player.x + this.player.velocityX;
    if (this.isValidPosition(newX, this.player.y)) {
      this.player.x = newX;
    }

    // Apply vertical movement with collision
    const newY = this.player.y + this.player.velocityY;
    if (this.isValidPosition(this.player.x, newY)) {
      this.player.y = newY;
    } else {
      // Hit ground or ceiling
      if (this.player.velocityY > 0) {
        // Hit ground
        this.player.isJumping = false;
      }
      this.player.velocityY = 0;
    }

    // Check for hazards
    this.checkHazards();
  }

  private updateEnemies(): void {
    for (const enemy of this.enemies) {
      EnemyAI.updateEnemy(enemy, this.player, this.world);

      // Enemy attack logic
      if (
        enemy.attackCooldown <= 0 &&
        this.distance(enemy.x, enemy.y, this.player.x, this.player.y) < 2
      ) {
        this.player.health -= enemy.attack;
        this.ui.add_log(`Enemy hit you for ${enemy.attack} damage!`, 0);
        enemy.attackCooldown = 60; // 1 second cooldown
      }

      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown--;
      }
    }
  }

  private updateProjectiles(): void {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.x += projectile.dx;
      projectile.y += projectile.dy;

      // Remove if out of bounds
      if (
        projectile.x < 0 ||
        projectile.x >= this.world.width ||
        projectile.y < 0 ||
        projectile.y >= this.world.height
      ) {
        return false;
      }

      // Check collisions
      if (projectile.isPlayerProjectile) {
        // Player projectile hits enemies
        for (const enemy of this.enemies) {
          if (this.distance(projectile.x, projectile.y, enemy.x, enemy.y) < 1) {
            enemy.health -= projectile.damage;
            if (enemy.health <= 0) {
              this.enemies = this.enemies.filter((e) => e !== enemy);
            }
            return false;
          }
        }
      } else {
        // Enemy projectile hits player
        if (
          this.distance(
            projectile.x,
            projectile.y,
            this.player.x,
            this.player.y
          ) < 1
        ) {
          this.player.health -= projectile.damage;
          return false;
        }
      }

      return true;
    });
  }

  private updateCamera(): void {
    // Center camera on player, but don't show beyond world edges
    const screenWidth = 40;
    this.cameraX = Math.max(
      0,
      Math.min(this.player.x - screenWidth / 2, this.world.width - screenWidth)
    );
  }

  private checkCollisions(): void {
    // Player with enemies
    for (const enemy of this.enemies) {
      if (this.distance(this.player.x, this.player.y, enemy.x, enemy.y) < 1.5) {
        // Push player away from enemy
        const pushDirection = this.player.x < enemy.x ? -0.5 : 0.5;
        this.player.x += pushDirection;
      }
    }
  }

  private checkHazards(): void {
    const tileX = Math.floor(this.player.x);
    const tileY = Math.floor(this.player.y);

    if (
      tileX >= 0 &&
      tileX < this.world.width &&
      tileY >= 0 &&
      tileY < this.world.height
    ) {
      //@ts-expect-error
      const tile = this.world.tiles[tileY][tileX]!;
      if (tile.type === "spike" && tile.damage) {
        this.player.health -= tile.damage;
        this.ui.add_log(`You took ${tile.damage} damage from spikes!`, 0);
      }
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    if (x < 0 || x >= this.world.width || y < 0 || y >= this.world.height) {
      return false;
    }

    // Check all tiles the player occupies
    for (
      let checkY = Math.floor(y);
      checkY < Math.floor(y) + this.player.height;
      checkY++
    ) {
      for (
        let checkX = Math.floor(x);
        checkX < Math.floor(x) + this.player.width;
        checkX++
      ) {
        if (
          checkX >= 0 &&
          checkX < this.world.width &&
          checkY >= 0 &&
          checkY < this.world.height
        ) {
          //@ts-expect-error
          const tile = this.world.tiles[checkY][checkX]!;
          if (tile.solid) {
            return false;
          }
        } else {
          return false; // Out of bounds
        }
      }
    }

    return true;
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private render(): void {
    const screenWidth = 40;
    const screenHeight = 20;
    let display = "";

    // Game info header
    display += `HEALTH: ${this.player.health}% | ENEMIES: ${this.enemies.length}\n`;
    display += "─".repeat(screenWidth) + "\n";

    // Render visible portion of world
    for (let y = 0; y < screenHeight - 2; y++) {
      for (let x = 0; x < screenWidth; x++) {
        const worldX = Math.floor(this.cameraX + x);
        const worldY = y;

        let char = " ";
        let color = "white";

        // Draw world tiles
        if (
          worldX >= 0 &&
          worldX < this.world.width &&
          worldY >= 0 &&
          worldY < this.world.height
        ) {
          //@ts-expect-error
          const tile = this.world.tiles[worldY][worldX]!;
          char = tile.symbol;
          color = tile.color;
        }

        // Draw player
        if (
          Math.floor(this.player.x) === worldX &&
          Math.floor(this.player.y) === worldY
        ) {
          char = this.player.symbol;
          color = "cyan";
        }

        // Draw enemies
        for (const enemy of this.enemies) {
          if (
            Math.floor(enemy.x) === worldX &&
            Math.floor(enemy.y) === worldY
          ) {
            char = enemy.symbol;
            color = "red";
          }
        }

        // Draw projectiles
        for (const projectile of this.projectiles) {
          if (
            Math.floor(projectile.x) === worldX &&
            Math.floor(projectile.y) === worldY
          ) {
            char = projectile.symbol;
            color = projectile.isPlayerProjectile ? "yellow" : "magenta";
          }
        }

        display += `{${color}-fg}${char}{/}`;
      }
      display += "\n";
    }

    // Controls reminder
    display += "─".repeat(screenWidth) + "\n";
    display += "ARROWS: Move | SPACE: Jump | Z: Attack | Q: Quit";

    // Update UI
    this.ui.update_game_area(display);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/*=======================================================*
 |                    ENEMY AI SYSTEM                    |
 *=======================================================*/

class EnemyAI {
  static updateEnemy(
    enemy: Enemy,
    player: PlayerInstance,
    world: WorldLevel
  ): void {
    switch (enemy.type) {
      case "patrol":
        this.patrolBehavior(enemy, world);
        break;
      case "shooter":
        this.shooterBehavior(enemy, player, world);
        break;
      case "charger":
        this.chargeBehavior(enemy, player, world);
        break;
    }

    // Always face the player if close
    if (Math.abs(enemy.x - player.x) < 8) {
      enemy.facing = enemy.x < player.x ? "right" : "left";
    }
  }

  private static patrolBehavior(enemy: Enemy, world: WorldLevel): void {
    const newX = enemy.x + enemy.direction * 0.5;

    // Check if we hit a wall or edge
    if (
      !this.isValidPosition(newX, enemy.y, world) ||
      Math.abs(enemy.x - enemy.patrolStartX) > enemy.patrolRange
    ) {
      enemy.direction *= -1; // Turn around
    } else {
      enemy.x = newX;
    }
  }

  private static shooterBehavior(
    enemy: Enemy,
    player: PlayerInstance,
    world: WorldLevel
  ): void {
    // Simple shooting logic
    if (Math.abs(enemy.x - player.x) < 10 && Math.random() < 0.02) {
      // Create projectile toward player
      const dx = player.x > enemy.x ? 1 : -1;
      world.enemies.forEach((e) => {
        if (e === enemy) {
          // This would be added to projectiles array
          // For now, we'll handle this in the main combat class
        }
      });
    }
  }

  private static chargeBehavior(
    enemy: Enemy,
    player: PlayerInstance,
    world: WorldLevel
  ): void {
    if (Math.abs(enemy.x - player.x) < 5) {
      // Charge toward player
      const chargeDirection = player.x > enemy.x ? 1 : -1;
      enemy.x += chargeDirection * 0.8;
    }
  }

  private static isValidPosition(
    x: number,
    y: number,
    world: WorldLevel
  ): boolean {
    if (x < 0 || x >= world.width || y < 0 || y >= world.height) {
      return false;
    }
//@ts-expect-error
    return !world.tiles[Math.floor(y)][Math.floor(x)].solid;
  }
}

/*=======================================================*
 |                   WORLD GENERATOR                     |
 *=======================================================*/

class WorldGenerator {
  static generateLevel(level: number): WorldLevel {
    const width = 100; // Wider level for horizontal scrolling
    const height = 20;
    const tiles: Tile[][] = [];

    // Initialize empty world
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        //@ts-expect-error
        tiles[y][x] = {
          symbol: " ",
          color: "white",
          solid: false,
          type: "empty",
        };
      }
    }

    // Generate terrain based on level theme
    switch (level) {
      case 1:
        this.generateForestLevel(tiles, width, height);
        break;
    }

    return {
      width,
      height,
      tiles,
      enemies: this.generateEnemies(level, tiles),
      items: this.generateItems(level),
      startPosition: { x: 2, y: height - 3 },
      endPosition: { x: width - 2, y: height - 3 },
    };
  }

  private static generateForestLevel(
    tiles: Tile[][],
    width: number,
    height: number
  ): void {
    // Ground
    for (let x = 0; x < width; x++) {
      //@ts-expect-error
      tiles[height - 1][x] = {
        symbol: "█",
        color: "green",
        solid: true,
        type: "ground",
      };

      //@ts-expect-error
      tiles[height - 2][x] = {
        symbol: "▒",
        color: "green",
        solid: true,
        type: "ground",
      };
    }

    // Platforms for jumping challenges
    this.createPlatform(tiles, 10, height - 4, 5);
    this.createPlatform(tiles, 20, height - 6, 4);
    this.createPlatform(tiles, 30, height - 8, 6);
    this.createPlatform(tiles, 45, height - 5, 3);
    this.createPlatform(tiles, 60, height - 7, 4);
    this.createPlatform(tiles, 75, height - 4, 6);

    // Obstacles and hazards
    this.createSpikes(tiles, 15, height - 1, 3);
    this.createWall(tiles, 25, height - 3, 3);
    this.createSpikes(tiles, 40, height - 1, 2);
    this.createWall(tiles, 55, height - 4, 2);
    this.createSpikes(tiles, 70, height - 1, 4);
  }

  private static generateEnemies(level: number, tiles: Tile[][]): Enemy[] {
    const enemies: Enemy[] = [];

    // Patrol enemies
    enemies.push({
      x: 12,
      y: 17,
      symbol: "👹",
      health: 30,
      maxHealth: 30,
      attack: 5,
      type: "patrol",
      patrolRange: 6,
      direction: 1,
      facing: "right",
      attackCooldown: 0,
      patrolStartX: 12,
    });

    enemies.push({
      x: 35,
      y: 14,
      symbol: "👻",
      health: 40,
      maxHealth: 40,
      attack: 8,
      type: "shooter",
      patrolRange: 4,
      direction: -1,
      facing: "left",
      attackCooldown: 0,
      patrolStartX: 35,
    });

    enemies.push({
      x: 65,
      y: 17,
      symbol: "🐉",
      health: 60,
      maxHealth: 60,
      attack: 12,
      type: "charger",
      patrolRange: 3,
      direction: 1,
      facing: "right",
      attackCooldown: 0,
      patrolStartX: 65,
    });

    return enemies;
  }

  private static generateItems(level: number): any[] {
    return []; // Can add health packs, coins, etc.
  }

  private static createPlatform(
    tiles: Tile[][],
    startX: number,
    y: number,
    length: number,
    symbol: string = "─",
    color: string = "yellow"
  ): void {
    for (let x = startX; x < startX + length; x++) {
      //@ts-expect-error
      tiles[y][x] = { symbol, color, solid: true, type: "platform" };
    }
  }

  private static createSpikes(
    tiles: Tile[][],
    startX: number,
    y: number,
    count: number
  ): void {
    for (let x = startX; x < startX + count; x++) {
      //@ts-expect-error
      tiles[y][x] = {
        symbol: "▲",
        color: "red",
        solid: false,
        type: "spike",
        damage: 10,
      };
    }
  }

  private static createWall(
    tiles: Tile[][],
    x: number,
    startY: number,
    height: number
  ): void {
    for (let y = startY; y > startY - height; y--) {
      //@ts-expect-error
      tiles[y][x] = {
        symbol: "▓",
        color: "yellow",
        solid: true,
        type: "wall",
      };
    }
  }
}
