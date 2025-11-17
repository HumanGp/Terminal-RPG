class WorldMapSystem {
  private areas: GameArea[] = [];
  private currentArea: GameArea;

  constructor() {
    this.initializeAreas();
    this.currentArea = this.areas[0];
  }

  private initializeAreas(): void {
    this.areas = [
      {
        id: "CORRUPTED_FOREST",
        name: "Corrupted Forest",
        description:
          "A once-beautiful forest now twisted by glitches and syntax errors.",
        requiredLevel: 1,
        enemyTypes: ["Syntax Error", "Null Pointer"],
        rewards: { minGold: 5, maxGold: 15, exp: 25 },
        dangerLevel: "LOW",
        asciiArt: `
          O               .~~~.
         /|\\             / o o \\
         / \\             \\  ▽  /
        ⚔️                    ︿
        `,
        lore: "The forest where bugs first appeared. Perfect for beginners.",
      },
      {
        id: "BUG_INFESTED_CAVES",
        name: "Bug-Infested Caves",
        description:
          "Dark caves filled with memory leaks and buffer overflows.",
        requiredLevel: 4,
        enemyTypes: ["Memory Leak", "Buffer Overflow"],
        rewards: { minGold: 15, maxGold: 30, exp: 50 },
        dangerLevel: "MEDIUM",
        asciiArt: `
          O               .-.
         /|\\             (0.0)
         / \\              |=|
        🗡️                / \\
        `,
        lore: "Deep caves where forgotten code breeds dangerous creatures.",
      },
      {
        id: "GLITCH_CANYON",
        name: "Glitch Canyon",
        description:
          "A treacherous canyon where reality flickers and loops endlessly.",
        requiredLevel: 7,
        enemyTypes: ["Infinite Loop", "Stack Overflow"],
        rewards: { minGold: 30, maxGold: 60, exp: 100 },
        dangerLevel: "HIGH",
        asciiArt: `
          O               ╔═╗
         /|\\             ║∞║
         / \\             ╚═╝
        🔥                💫
        `,
        lore: "The canyon where time itself has been corrupted by infinite loops.",
      },
      {
        id: "KERNEL_CITADEL",
        name: "Kernel Citadel",
        description:
          "The fortress of the Glitch King, where the final battle awaits.",
        requiredLevel: 10,
        enemyTypes: ["Glitch King"],
        rewards: { minGold: 100, maxGold: 200, exp: 250 },
        dangerLevel: "EXTREME",
        asciiArt: `
          O               ░▒▓█
         /|\\             █KING█  
         / \\             █▒░█▓█
        💎               ▓█░▒▓█
        `,
        lore: "The heart of the corruption. Only the strongest can challenge the Glitch King.",
        isBossArea: true,
      },
    ];
  }

  getArea(areaId: string): GameArea | undefined {
    return this.areas.find((area) => area.id === areaId);
  }

  getAllAreas(): GameArea[] {
    return this.areas;
  }

  canAccessArea(areaId: string, playerLevel: number): boolean {
    const area = this.getArea(areaId);
    return area ? playerLevel >= area.requiredLevel : false;
  }

  getAreaStatus(areaId: string, playerLevel: number): AreaStatus {
    const area = this.getArea(areaId);
    if (!area) return "UNKNOWN";

    if (playerLevel >= area.requiredLevel) {
      return playerLevel >= area.requiredLevel + 3 ? "COMPLETED" : "ACCESSIBLE";
    } else {
      return "LOCKED";
    }
  }

  generateEnemyForArea(areaId: string, playerLevel: number): Enemy {
    const area = this.getArea(areaId);
    if (!area) {
      throw new Error(`Area ${areaId} not found`);
    }

    const enemyType =
      area.enemyTypes[Math.floor(Math.random() * area.enemyTypes.length)];
    const baseLevel = area.requiredLevel;

    // Scale enemy level based on player level, but keep it challenging
    const enemyLevel = Math.min(
      baseLevel + 2,
      Math.max(baseLevel, playerLevel + Math.floor(Math.random() * 3) - 1)
    );

    const difficulty = area.isBossArea
      ? "BOSS"
      : area.dangerLevel === "EXTREME"
      ? "HARD"
      : area.dangerLevel === "HIGH"
      ? "HARD"
      : area.dangerLevel === "MEDIUM"
      ? "MEDIUM"
      : "EASY";

    return new Enemy(enemyType, enemyType, difficulty, enemyLevel);
  }

  getAreaRewards(areaId: string): { gold: number; exp: number } {
    const area = this.getArea(areaId);
    if (!area) return { gold: 0, exp: 0 };

    const gold = Math.floor(
      Math.random() * (area.rewards.maxGold - area.rewards.minGold) +
        area.rewards.minGold
    );

    return { gold, exp: area.rewards.exp };
  }
}

interface GameArea {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  enemyTypes: string[];
  rewards: {
    minGold: number;
    maxGold: number;
    exp: number;
  };
  dangerLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  asciiArt: string;
  lore: string;
  isBossArea?: boolean;
}

type AreaStatus = "LOCKED" | "ACCESSIBLE" | "COMPLETED" | "UNKNOWN";

interface WorldLevel { }

interface WorldTile {
  symbol: string;
  color: string;
  solid: boolean;
  type: string;
 }

class WorldGenerator {
  static generateLevel(level: number): WorldLevel {
    const width = 80;
    const height = 20;
    const tiles: WorldTile[][] = [];

    //initialize empty world
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        tiles[y][x] = {
          symbol: " ",
          color: "white",
          solid: false,
          type: "empty",
        };
      }
    }

    //Generate terrain based on level theme
    switch (level) {
      case 1:
        this.generateForestLevel(tiles, width, height);
      case 2:
        this.generateFactoryLevel(tiles, width, height);
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
    tiles: WorldTile[][],
    width: number,
    height: number
  ): void {
    //Ground
    for (let x = 0; x < width; x++) {
      tiles[height - 1][x] = {
        symbol: "█",
        color: "green",
        solid: true,
        type: "ground",
      };
      tiles[height - 2][x] = {
        symbol: "▒",
        color: "green",
        solid: true,
        type: "ground",
      };
    }

    //Platforms
    this.createPlatform(tiles, 10, height - 4, 5);
    this.createPlatform(tiles, 20, height - 6, 4);
    this.createPlatform(tiles, 30, height - 8, 6);
    this.createPlatform(tiles, 45, height - 5, 3);

    // Trees/obstacles
    for (let x = 15; x < 18; x++) {
      tiles[height - 3][x] = {
        symbol: "▓",
        color: "brown",
        solid: true,
        type: "wall",
      };
    }

    // Ladders
    this.createLadder(tiles, 25, height - 8, 4);
  }

  private static generateFactoryLevel(
    tiles: WorldTile[][],
    width: number,
    height: number
  ): void {
    // Metal floor
    for (let x = 0; x < width; x++) {
      tiles[height - 1][x] = {
        symbol: "═",
        color: "gray",
        solid: true,
        type: "ground",
      };
    }

    // Platforms and machinery
    this.createPlatform(tiles, 5, height - 3, 8, "═", "gray");
    this.createPlatform(tiles, 18, height - 5, 6, "═", "gray");
    this.createPlatform(tiles, 30, height - 7, 4, "═", "gray");

    // Conveyor belts, pipes, etc.
    this.createPipe(tiles, 12, height - 4, 3);
    this.createSpikes(tiles, 40, height - 1, 5);
  }

  private static generateEnemies(level: WorldLevel, tiles: WorldTile[][]) { }
  
  private static generateItems(level: WorldLevel){ }

  private static createPlatform(
    tiles: WorldTile[][],
    startX: number,
    y: number,
    length: number,
    symbol: string = "─",
    color: string = "yellow"
  ): void {
    for (let x = startX; x < startX + length; x++) {
      tiles[y][x] = { symbol, color, solid: true, type: "platform" };
    }
  }

  private static createLadder(
    tiles: WorldTile[][],
    x: number,
    startY: number,
    height: number
  ): void {
    for (let y = startY; y < startY + height; y++) {
      tiles[y][x] = {
        symbol: "H",
        color: "brown",
        solid: false,
        type: "ladder",
      };
    }
  }

  private static createPipe(
    tiles: WorldTile[][],
    x: number,
    startY: number,
    height: number
  ): void {
    for (let y = startY; y > startY - height; y--) {
      tiles[y][x] = { symbol: "│", color: "gray", solid: true, type: "wall" };
    }
  }

  private static createSpikes(
    tiles: WorldTile[][],
    startX: number,
    y: number,
    count: number
  ): void {
    for (let x = startX; x < startX + count; x++) {
      tiles[y][x] = { symbol: "▲", color: "red", solid: false, type: "spike" };
    }
  }
}
