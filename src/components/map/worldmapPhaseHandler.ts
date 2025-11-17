class WorldMapPhaseHandler extends GamePhaseHandler {
  private worldMap: WorldMapSystem;

  constructor(gameStore: GameStore, ui: Game_UI) {
    super(gameStore, ui);
    this.worldMap = new WorldMapSystem();
  }

  protected async onEnter(): Promise<void> {
    await this.ui.add_log("Entering world map...", 30);
    this.ui.showPhaseWidgets("world");
  }

  protected async render(): Promise<void> {
    const state = this.getState();
    const screenData = this.generateWorldMapScreen(state.hero!);

    this.ui.updateWorldMap(screenData.content.join("\n"));
    this.ui.updatePlayerStats({
      hp: state.hero!.health,
      mp: (state.hero! as any).mana || 0,
      level: state.hero!.level,
      gold: state.hero!.gold,
    });
  }

  protected async handleInput(): Promise<void> {
    const state = this.getState();
    let validInput = false;

    while (!validInput) {
      this.ui.update_actions([
        "[1-4] Travel to Area",
        "[I] Inventory",
        "[S] Shop",
        "[C] Character Info",
        "[Q] Quit Game",
      ]);

      const input = await this.ui.getInput("Choose action: ");

      switch (input) {
        case "1":
        case "2":
        case "3":
        case "4":
          await this.handleAreaTravel(input, state.hero!);
          validInput = true;
          break;

        case "I":
          await this.showInventory(state.hero!);
          break;

        case "S":
          await this.showShop(state.hero!);
          break;

        case "C":
          await this.showCharacterInfo(state.hero!);
          break;

        case "Q":
          await this.handleQuit();
          validInput = true;
          break;

        default:
          await this.ui.add_log(
            "Invalid action! Use 1-4 to travel, I for inventory, S for shop, C for character, Q to quit.",
            30
          );
      }
    }
  }

  private async handleAreaTravel(
    areaNumber: string,
    hero: Character_Hero
  ): Promise<void> {
    const areaId = this.getAreaIdFromNumber(areaNumber);
    const area = this.worldMap.getArea(areaId);

    if (!area) {
      await this.ui.add_log("Invalid area selection!", 30);
      return;
    }

    if (this.worldMap.canAccessArea(areaId, hero.level)) {
      await this.ui.add_log(`Traveling to ${area.name}...`, 30);
      await this.delay(1000);

      this.gameStore.setArea(areaId);
      this.gameStore.setPhase("COMBAT");
    } else {
      await this.ui.add_log(
        `Area locked! You need to be level ${area.requiredLevel} to enter ${area.name}.`,
        30
      );
      await this.delay(1000);
    }
  }

  private getAreaIdFromNumber(areaNumber: string): string {
    const areaMap: { [key: string]: string } = {
      "1": "CORRUPTED_FOREST",
      "2": "BUG_INFESTED_CAVES",
      "3": "GLITCH_CANYON",
      "4": "KERNEL_CITADEL",
    };
    return areaMap[areaNumber] || "CORRUPTED_FOREST";
  }

  private generateWorldMapScreen(hero: Character_Hero): ScreenData {
    const areas = this.worldMap.getAllAreas();

    const content = [
      "{bold}Choose your destination:{/bold}",
      "══════════════════════════════════════════",
      "",
    ];

    areas.forEach((area, index) => {
      const areaNumber = index + 1;
      const status = this.worldMap.getAreaStatus(area.id, hero.level);
      const statusIcon = this.getStatusIcon(status);
      const statusColor = this.getStatusColor(status);

      content.push(
        `[${areaNumber}] {bold}${area.name}{/bold}`,
        `   ${statusIcon} Level Required: ${area.requiredLevel} | Danger: ${area.dangerLevel}`,
        `   ${area.description}`,
        `   {${statusColor}-fg}Status: ${status}{/${statusColor}-fg}`,
        ""
      );
    });

    content.push(
      "══════════════════════════════════════════",
      `Current Level: ${hero.level} | Gold: ${hero.gold} | Health: ${hero.health}/${hero.maxHealth}`,
      `Experience: ${hero.experience}/${hero.level * 100}`
    );

    if (
      hero.level >= 10 &&
      this.worldMap.getAreaStatus("KERNEL_CITADEL", hero.level) === "ACCESSIBLE"
    ) {
      content.push("");
      content.push(
        "{red-fg}{bold}Warning: The Glitch King awaits in Kernel Citadel!{/bold}{/red-fg}"
      );
    }

    return {
      title: "WORLD MAP",
      content,
      actions: [
        "[1-4] Travel",
        "[I] Inventory",
        "[S] Shop",
        "[C] Character",
        "[Q] Quit",
      ],
      asciiArt: this.generateWorldMapASCII(hero),
    };
  }

  private getStatusIcon(status: AreaStatus): string {
    switch (status) {
      case "LOCKED":
        return "🔒";
      case "ACCESSIBLE":
        return "✅";
      case "COMPLETED":
        return "🏆";
      default:
        return "❓";
    }
  }

  private getStatusColor(status: AreaStatus): string {
    switch (status) {
      case "LOCKED":
        return "red";
      case "ACCESSIBLE":
        return "green";
      case "COMPLETED":
        return "yellow";
      default:
        return "white";
    }
  }

  private generateWorldMapASCII(hero: Character_Hero): string {
    const areas = this.worldMap.getAllAreas();
    let asciiMap = `
          🗺️ WORLD MAP 🗺️
    ┌─────────┬─────────┐
    │         │         │
    │   1️⃣    │   2️⃣    │
    │  ${this.getAreaSymbol("CORRUPTED_FOREST", hero)}  │  ${this.getAreaSymbol(
      "BUG_INFESTED_CAVES",
      hero
    )}  │
    │         │         │
    ├─────────┼─────────┤
    │         │         │
    │   3️⃣    │   4️⃣    │
    │  ${this.getAreaSymbol("GLITCH_CANYON", hero)}  │  ${this.getAreaSymbol(
      "KERNEL_CITADEL",
      hero
    )}  │
    │         │         │
    └─────────┴─────────┘
    `;

    // Add legend
    asciiMap += `
    Legend:
    🌲 Corrupted Forest
    🕳️  Bug Caves  
    🌄 Glitch Canyon
    🏰 Kernel Citadel
    `;

    return asciiMap;
  }

  private getAreaSymbol(areaId: string, hero: Character_Hero): string {
    const status = this.worldMap.getAreaStatus(areaId, hero.level);

    switch (areaId) {
      case "CORRUPTED_FOREST":
        return status === "LOCKED" ? "🔒" : "🌲";
      case "BUG_INFESTED_CAVES":
        return status === "LOCKED" ? "🔒" : "🕳️";
      case "GLITCH_CANYON":
        return status === "LOCKED" ? "🔒" : "🌄";
      case "KERNEL_CITADEL":
        return status === "LOCKED" ? "🔒" : "🏰";
      default:
        return "❓";
    }
  }

  private async showInventory(hero: Character_Hero): Promise<void> {
    // Simple inventory display for now
    await this.ui.add_log("Inventory:", 30);
    await this.ui.add_log("- Health Potion x3", 30);
    await this.ui.add_log("- Basic Sword", 30);
    await this.ui.add_log("- Leather Armor", 30);
    await this.ui.add_log("Press any key to continue...", 30);
    await this.ui.waitForAnyKey();
    await this.render(); // Refresh the screen
  }

  private async showShop(hero: Character_Hero): Promise<void> {
    await this.ui.add_log("Welcome to the Shop!", 30);
    await this.ui.add_log("Available items:", 30);
    await this.ui.add_log("- Health Potion: 50 gold", 30);
    await this.ui.add_log("- Mana Potion: 75 gold", 30);
    await this.ui.add_log("- Iron Sword: 200 gold", 30);
    await this.ui.add_log(`Your gold: ${hero.gold}`, 30);
    await this.ui.add_log("Press any key to continue...", 30);
    await this.ui.waitForAnyKey();
    await this.render(); // Refresh the screen
  }

  private async showCharacterInfo(hero: Character_Hero): Promise<void> {
    await this.ui.add_log(`Character: ${hero.name} the ${hero.class}`, 30);
    await this.ui.add_log(`Level: ${hero.level}`, 30);
    await this.ui.add_log(`Health: ${hero.health}/${hero.maxHealth}`, 30);

    if (hero instanceof Mage) {
      await this.ui.add_log(`Mana: ${(hero as Mage).mana}/100`, 30);
    } else if (hero instanceof Warrior) {
      await this.ui.add_log(`Rage: ${(hero as Warrior).rage}/100`, 30);
    } else if (hero instanceof Rogue) {
      await this.ui.add_log(`Energy: ${(hero as Rogue).energy}/100`, 30);
    }

    await this.ui.add_log(`Attack: ${hero.attack}`, 30);
    await this.ui.add_log(`Defense: ${hero.defense}`, 30);
    await this.ui.add_log(`Speed: ${hero.speed}`, 30);
    await this.ui.add_log(`Gold: ${hero.gold}`, 30);
    await this.ui.add_log(
      `Experience: ${hero.experience}/${hero.level * 100}`,
      30
    );
    await this.ui.add_log("Press any key to continue...", 30);
    await this.ui.waitForAnyKey();
    await this.render(); // Refresh the screen
  }

  private async handleQuit(): Promise<void> {
    await this.ui.add_log("Are you sure you want to quit? (Y/N)", 30);
    const confirmation = await this.ui.getInput("Confirm: ");

    if (confirmation === "Y" || confirmation === "YES") {
      await this.ui.add_log("Thanks for playing Terminal RPG!", 30);
      await this.delay(1000);
      process.exit(0);
    } else {
      await this.ui.add_log("Continue your adventure!", 30);
    }
  }

  protected async onExit(): Promise<void> {
    // Cleanup if needed
  }
}
