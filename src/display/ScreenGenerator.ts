import { Character_Enemy, Character_Hero } from "../types/characters_types";
import { Game_UI } from "./GameUI";
import type { GamePhase, ScreenData, ARTS,  } from "../types/UI_types";


class ScreenGenerator {
  static generateScreen(
    phase: GamePhase,
    hero: Character_Hero | null,
    enemy: Character_Enemy | null,
    area: keyof ARTS  = "CORRUPTED_FOREST"
  ): ScreenData {
    switch (phase) {
      case "BOOT":
        return this.generate_boot_screen();
      case "CHARACTER_CREATION":
        return this.generate_character_creation_screen();
      case "WORLD_MAP":
        return this.generate_world_map_screen(hero!);
      case "COMBAT":
        return this.generate_combat_screen(hero!, enemy!, area);
      case "INVENTORY":
        return this.generate_inventory_screen(hero!);
      case "SHOP":
        return this.generate_shop_screen(hero!);
      case "GAME_OVER":
        return this.generate_game_over_screen(hero!);
      default:
        return this.generate_default_screen();
    }
  }

  // BOOT SCREEN
  private static generate_boot_screen(): ScreenData {
    return {
      title: "TERMINAL RPG",
      content: [
        "Long ago, the code Realm was peacefull ...",
        "until the Glitch King corrupted the core systems",
        " ",
        "Now, bugs roam as monsters, errors twist reality,",
        "and you are the last Debugger who can restore order",
      ],
      actions: ["[ENTER] Start Game"],
      asciiArt: `Boot ascii Art`,
    };
  }

  //CHARACTER CREATION SCREEN
  private static generate_character_creation_screen(): ScreenData {
    return {
      title: "CHARACTER CREATION",
      content: [
        "Choose your path brave adventurer:",
        "··········································",
        " ",

        "[W] WARRIOR - Strong and resilient",
        " • High Health & Defense",
        " • Rage-based abilities",
        " • Perfect for beginners",
        " ",

        "[M] MAGE - Maste or arcane arts",
        " • Powerful spells",
        " • Mana management",
        " • Strategic gameplay",
        " ",

        "[R] ROUGE - Swift and deadly",
        " • High critical chance",
        " • Energy-based skills",
        " • High risk, high reward",
      ],
      actions: ["[W] Warrior", "[M] Mage", "[R] Rogue"],
      asciiArt: `character generation art`,
    };
  }

  // WORLD MAP SCREEN
  private static generate_world_map_screen(hero: Character_Hero): ScreenData {
    return {
      title: "WORLD MAP",
      content: [
        "Travel to your next destination:",
        "··········································",
        " ",

        "[1] CORRUPTED FOREST",
        " • Level: 1-3",
        " • Enemies: Syntax Errors, Type Bugs",
        ` • Status: ${hero.level >= 1 ? "READY" : "LOCKED"}`,
        " ",

        "[2] BUG-INFESTED CAVES",
        " • Level: 4-6",
        " • Enemies: Memory Leeches, Null Pointers",
        ` • Status: ${hero.level >= 4 ? "READY" : "LOCKED"}`,
        " ",

        "[3] GLITCH CANYON",
        " • Level: 7-9",
        " • Enemies: Infinite Loops, Stack Overflow",
        ` • Status: ${hero.level >= 7 ? "READY" : "LOCKED"} `,
        "",

        "[4] KERNEL CITADEL",
        " • Level: 10+",
        " • Enemy: The Glitch King",
        ` • Status: ${hero.level >= 10 ? "READY" : "LOCKED"}`,
        " ",

        `Current Level: ${hero.level} | Gold: ${hero.gold || 0}`,
      ],

      actions: ["[1-4] Travel", "[I] Inventory", "[S] Shop", "[Q] Quit"],
      asciiArt: `generate world map ascii`,
    };
  }

  private static generate_combat_screen(
    hero: Character_Hero,
    enemy: Character_Enemy,
    area: keyof ARTS
  ): ScreenData {
    const healthBar = (character: Character_Hero | Character_Enemy) => {
      const bars = Math.floor(character.health / 10);
      const progress_characters = Game_UI.ASCII.progress_characters;

      return (
        progress_characters["intensity_1"].repeat(bars) +
        progress_characters["intensity_4"].repeat(10 - bars)
      );
    };

    return {
      title: `COMBAT - ${area.toUpperCase()}`,
      content: [
        `${this.get_combat_ascii(area)}`,
        `${hero.name}`,
        `${healthBar(hero)} ${hero.health}%`,
        " ",
        "VS",
        " ",
        `${enemy.name}`,
        `${healthBar(enemy)} ${enemy.health}%`,
        " ",
        `${this.get_combat_status(hero, enemy)}`,
      ],
      actions: this.get_combat_actions(hero),
      asciiArt: this.get_combat_ascii(area),
    };
  }

  private static get_combat_ascii(area: keyof ARTS): string {
 
      const arts:ARTS = {
      "CORRUPTED_FOREST": `
        O               .~~~.
       /|\\             / o o \\
       / \\             \\  ▽  /
      ⚔️                    ︿
      `,

      "BUG_INFESTED_CAVES": `
        O               .-.
       /|\\             (0.0)
       / \\              |=|
      🗡️                / \\
      `,

      "GLITCH_CANYON": `
        O               ╔═╗
       /|\\             ║∞║
       / \\             ╚═╝
      🔥                💫
      `,

      "KERNEL_CITADEL": `
        O               ░▒▓█
       /|\\             █KING█  
       / \\             █▒░█▓█
      💎               ▓█░▒▓█
      `,
    };

    return arts[area] || arts["CORRUPTED_FOREST"];
  }

  private static get_combat_actions(hero: Character_Hero): string[] {
    const baseActions = ["[A] Attack", "[H] Heal", "[D] Defend", "[R] Run"];

    // Add class-specific abilities
    if (hero.class === "Mage") {
      baseActions.push("[F] Fireball", "[I] Ice Shield");
    } else if (hero.class === "Rogue") {
      baseActions.push("[B] Backstab", "[P] Poison Dart");
    } else if (hero.class === "Warrior") {
      baseActions.push("[S] Shield Bash", "[W] Whirlwind");
    }

    return baseActions;
  }

  private static get_combat_status(hero: Character_Hero, enemy: Character_Enemy): string {
    const status = [];
      
    if (hero.health < 30) status.push("💔 Hero is badly wounded!");
    if (enemy.health < 30) status.push("🎯 Enemy is weak!");
    // if (hero.statusEffects?.length > 0)
      // status.push(`⚡ ${hero.statusEffects.join(", ")}`);

    return status.join("\n") || "Combat is intense!";
  }
    
  //INVENTORY SCREEN
    private static generate_inventory_screen(hero: Character_Hero): ScreenData {
    const items = hero.inventory.length > 0 
      ? hero.inventory.map((item, index) => `[${index + 1}] ${item}`).join('\n')
      : "Your inventory is empty!";

     return {
        title: "INVENTORY",
        content: [
            `Gold: ${hero.gold || 0}`,
            `ITEMS: ${items}`,
            // `EQUIPMENT: Weapon: ${hero.weapon || "Basic Sword"} Armor: ${hero.armor || "Leather Armor"}`
        ],
        actions: ["[1-9] Use Item", "[E] Equip", "[B] Back"],
        asciiArt: `
        ╔══════════╗
        ║ 🎒 INV   ║
        ╠══════════╣
        ║ 💰🥤⚗️ 🗡️ ║
        ║ 🛡️ 🧪📜🔮 ║
        ╚══════════╝
       `
    };
  }

  // SHOP SCREEN
  private static generate_shop_screen(hero: Character_Hero): ScreenData {
    return {
      title: "MERCHANT'S SHOP",
      content: [
            "Welcome traveler! What'll it be?",
            " ",
            "[1] Health Potion - 50 gold",
            "• Restores 50 HP",
            " ",
            "[2] Mana Potion - 75 gold",  
            "• Restores 30 MP",
            " ",
            "[3] Iron Sword - 200 gold",
            " • +5 Attack",
            " ",
            "[4] Leather Armor - 150 gold",
            "• +3 Defense",
            " ",
            `Your Gold: ${hero.gold || 0}`,
        ],
      actions: ["[1-4] Buy", "[S] Sell", "[B] Back"],
      asciiArt: `
        ╔══════════╗
        ║ 🏪 SHOP  ║
        ╠══════════╣
        ║ 💰💰💰   ║
        ║   🤝     ║
        ║ 🛒      🛍️ ║
        ╚══════════╝
      `
    };
  }

  // GAME OVER SCREEN
  private static generate_game_over_screen(hero: Character_Hero): ScreenData {
    const isVictory = hero.health > 0;
    
    return {
      title: isVictory ? "VICTORY!" : "GAME OVER",
      content: isVictory 
          ?
          [
        `Congratulations ${hero.name}!`, 
        " ",
        "You have defeated the Glitch King and restored peace to the Code Realm!",
        " ", 
        "Final Stats: ",
        `Level: ${hero.level}`,
        `Gold: ${hero.gold || 0}`,
              `Enemies Defeated: ${hero.enemiesDefeated || 0}`
          ]
          :
          [
            `You have been defeated...`,
            "But your legend will inspire others",
            "to continue the fight against the Glitch King.",
             `Final Level: ${hero.level}`,
              `Gold Collected: ${hero.gold || 0}`,
          ],
      actions: ["[R] Restart", "[Q] Quit"],
      asciiArt: isVictory ? `
        ╔══════════╗
        ║ 🏆 WIN!  ║
        ╠══════════╣
        ║   🌟    ║
        ║  🎉🎊   ║
        ║   💫    ║
        ╚══════════╝
      ` : `
        ╔══════════╗
        ║ 💀 LOST  ║
        ╠══════════╣
        ║   ☠️    ║
        ║  😵 💀  ║  
        ║   ⚰️    ║
        ╚══════════╝
      `
    };
  }

  private static generate_default_screen(): ScreenData {
    return {
      title: "TERMINAL RPG",
      content: ["Welcome to the adventure!"],
      actions: ["[ENTER] Continue"],
      asciiArt: "🎮"
    };
  }
}

export { ScreenGenerator };
