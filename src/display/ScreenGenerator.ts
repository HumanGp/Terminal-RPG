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

import { Character_Enemy, Character_Hero } from "../types/characters_types";
import { Game_UI } from "./GameUI";
import type { GamePhase, ScreenData, ARTS } from "../types/UI_types";
import { forestAreaASCII, WorldMaps } from "../assets/maps/maps";


class ScreenGenerator {
  static generateScreen(
    phase: GamePhase,
    hero?: Character_Hero | null,
    enemy?: Character_Enemy | null,
    area?: keyof ARTS
  ): ScreenData {
    switch (phase) {
      case "BOOT":
        return this.generate_boot_screen();
      case "CHARACTER_CREATION":
        return this.generate_character_creation_screen();
      case "WORLD_MAP":
        return this.generate_world_map_screen(hero!);
      case "COMBAT":
        return this.generate_combat_screen(hero!, area!);
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
      actions: ["[W]", "[M]", "[R]"],
      asciiArt: `character generation art`,
    };
  }

  // WORLD MAP SCREEN
  private static generate_world_map_screen(hero: Character_Hero): ScreenData {
    return {
      title: `WORLD MAP`,
      content: [
        "Travel to your next destination:",
        "··········································",
        " ",

        "[1] FOREST AREA",
        " • Level: 1-3",
        ` • Status: ${hero.level >= 1 ? "READY" : "LOCKED"}`,
        " ",

        `${forestAreaASCII.join('\n')}`,


        `Current Level: ${hero.level} | Gold: ${hero.gold || 0}`,
      ],

      actions: ["[1-4] Travel"],
      asciiArt: `generate world map ascii`,
    };
  }

  private static generate_combat_screen(
    hero: Character_Hero,
    area: keyof ARTS
  ): ScreenData {
    const ASCII = Game_UI.ASCII;
    const character_health_ascii = (
      character: Character_Hero | Character_Enemy
    ) =>
      ` ${character.name}: {#daa520-fg}${ASCII.progress_characters[
        "intensity_1"
      ].repeat(
        Math.max(0, Math.floor(character.health / 10))
      )}${ASCII.progress_characters["intensity_4"].repeat(
        Math.max(0, 10 - Math.floor(character.health / 10))
      )} ${character.health}%{/#daa520-fg}`;

    const combat_status = this.get_combat_status(hero, hero);

    return {
      title: `COMBAT - $`,
      content: [
        `${character_health_ascii(hero)}`,
        " ",
        "VS",    
        " ",
        `${combat_status}`,
      ],
      actions: this.get_combat_actions(hero),
      asciiArt: 'this.get_combat_ascii(area)',
    };
  }

  private static get_combat_ascii(area: keyof ARTS): string {
    const arts: ARTS = {
      FOREST_AREA: `
        O               .~~~.
       /|\\             / o o \\
       / \\             \\  ▽  /
      ⚔️                    ︿
      `,

      BUG_INFESTED_CAVES: `
        O               .-.
       /|\\             (0.0)
       / \\              |=|
      🗡️                / \\
      `,

      GLITCH_CANYON: `
        O               ╔═╗
       /|\\             ║∞║
       / \\             ╚═╝
      🔥                💫
      `,

      KERNEL_CITADEL: `
        O               ░▒▓█
       /|\\             █KING█  
       / \\             █▒░█▓█
      💎               ▓█░▒▓█
      `,
    };

    return arts[area] || arts["FOREST_AREA"];
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

  private static get_combat_status(
    hero: Character_Hero,
    enemy: Character_Enemy
  ): string {
    const status = [];

    if (hero.health < 30) status.push("💔 Hero is badly wounded!");
    if (enemy.health < 30) status.push("🎯 Enemy is weak!");
    if (hero.health > 80) status.push("💪 Hero is in great shape!");
    if (enemy.health > 80) status.push("😠 Enemy is strong!");

    // Add class-specific status hints
    if (hero.class === "Mage" && (hero as any).mana < 30) {
      status.push("🔮 Low mana!");
    }
    if (hero.class === "Rogue") {
      status.push("⚡ High critical chance");
    }
    if (hero.class === "Warrior") {
      status.push("🛡️ High defense");
    }

    return status.length > 0 ? status.join(" | ") : "Combat is intense!";
  }

  //INVENTORY SCREEN
  private static generate_inventory_screen(hero: Character_Hero): ScreenData {
    const items =
      hero.inventory.length > 0
        ? hero.inventory
            .map((item, index) => `[${index + 1}] ${item}`)
            .join("\n")
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
       `,
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
      `,
    };
  }

  // GAME OVER SCREEN
  private static generate_game_over_screen(hero: Character_Hero): ScreenData {
    const isVictory = hero.health > 0;

    return {
      title: isVictory ? "VICTORY!" : "GAME OVER",
      content: isVictory
        ? [
            `Congratulations ${hero.name}!`,
            " ",
            "You have defeated the Glitch King and restored peace to the Code Realm!",
            " ",
            "Final Stats: ",
            `Level: ${hero.level}`,
            `Gold: ${hero.gold || 0}`,
            `Enemies Defeated: ${hero.enemiesDefeated || 0}`,
          ]
        : [
            `You have been defeated...`,
            "But your legend will inspire others",
            "to continue the fight against the Glitch King.",
            `Final Level: ${hero.level}`,
            `Gold Collected: ${hero.gold || 0}`,
          ],
      actions: ["[R] Restart", "[Q] Quit"],
      asciiArt: isVictory
        ? `
        ╔══════════╗
        ║ 🏆 WIN!  ║
        ╠══════════╣
        ║   🌟    ║
        ║  🎉🎊   ║
        ║   💫    ║
        ╚══════════╝
      `
        : `
        ╔══════════╗
        ║ 💀 LOST  ║
        ╠══════════╣
        ║   ☠️    ║
        ║  😵 💀  ║  
        ║   ⚰️    ║
        ╚══════════╝
      `,
    };
  }

  private static generate_default_screen(): ScreenData {
    return {
      title: "TERMINAL RPG",
      content: ["Welcome to the adventure!"],
      actions: ["[ENTER] Continue"],
      asciiArt: "🎮",
    };
  }
}

export { ScreenGenerator };
