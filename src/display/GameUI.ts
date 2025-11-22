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

import { Widgets } from "blessed";
import type { Character_Enemy, Character_Hero } from "../types/characters_types";
import type { ASCII_Characters, LayoutConfig } from "../types/UI_types";
import {
  actionBar,
  Arena,
  ASCII,
  combatLog,
  enemyHealthGauge,
  enemyPanel,
  gameArea,
  healthGauge,
  heroPanel,
  inputArea,
  lcd,
  logArea,
  phaseTitle,
  screen,
  textArea,
} from "../components/UI/ui";

var blessed = require("blessed");
var contrib = require("blessed-contrib");

class Game_UI {
  public screen!: Widgets.Screen;
  private gameArea!: Widgets.BoxElement;
  private textArea!: Widgets.BoxElement;
  private logArea!: Widgets.Log;
  private phaseTitle!: Widgets.Log;
  private inputArea!: Widgets.TextboxElement;
  private actionBar!: Widgets.BoxElement;
  private layoutConfigs!: LayoutConfig;
  private currentLayout!: keyof LayoutConfig;
  private lcd: any;
  private heroPanel!: Widgets.BoxElement;
  private enemyPanel!: Widgets.BoxElement;
  private combatLog!: Widgets.Log;
  private healthGauge: any = null;
  private enemyHealthGauge: any = null;
  static ASCII: ASCII_Characters = ASCII;

  constructor(layoutConfigs: LayoutConfig) {
    this.layoutConfigs = layoutConfigs; // initialize with layout configs
    this.currentLayout = "boot"; // default layout | fallback layout
    this.initialize_standard_widgets();
    this.initialize_screen_events();
    this.initialize_gameArea_events();

    // this.initialize_combat_widgets();
    // this.initialize_lcd();
    // this.grid.applyLayout(screen);
  }

  /*=======================================================*
   |             INITIALIZE WIDGETS IN THE GRID            |
   *=======================================================*/

  // ****************** ~ GAME INTERFACE ~ *****************

  private initialize_lcd(): void {
    this.lcd = contrib.lcd(lcd);
    this.screen.append(this.lcd);
  }

  private initialize_screen_events(): void {
    //quit screen
    this.screen.key(
      ["escape", "q", "C-c"],
      function (ch: unknown, key: unknown) {
        return process.exit(0);
      }
    );
  }

  private initialize_gameArea_events(): void {
    // this.gameArea.on("click", (mouse) => {
    //   this.textArea.setContent(`You clicked ${mouse.x} , ${mouse.y}`);
    //   this.screen.render();
    // });
  }

  private initialize_standard_widgets(): void {
    this.screen = blessed.screen(screen);
    this.lcd = contrib.lcd(lcd);
    this.phaseTitle = blessed.box(phaseTitle);
    this.gameArea = blessed.box(gameArea);
    this.textArea = blessed.box(textArea);
    this.actionBar = blessed.box(actionBar);
    this.logArea = blessed.log(logArea);
    this.inputArea = blessed.textbox(inputArea);

    this.screen.append(this.phaseTitle);
    this.screen.append(this.gameArea);
    this.screen.append(this.actionBar);
    this.screen.append(this.logArea);
    this.screen.append(this.inputArea);
    this.gameArea.append(this.textArea);
  }

  // ******************** ~ COMBAT SCREEN ~ *****************

  private initialize_combat_widgets() {
    this.heroPanel = blessed.box(heroPanel);
    this.enemyPanel = blessed.box(enemyPanel);
    this.healthGauge = contrib.gauge(healthGauge);
    this.enemyHealthGauge = contrib.gauge(enemyHealthGauge);
    this.combatLog = blessed.log(combatLog);

    this.gameArea.append(this.heroPanel);
    this.gameArea.append(this.enemyPanel);
    this.gameArea.append(this.healthGauge);
    this.gameArea.append(this.enemyHealthGauge);
    this.gameArea.append(this.combatLog);
  }

  /*============================================================*
   |                      CONTROL METHODS                       | 
   *============================================================*/

  // ************************* ~ LCD ~ **************************

  set_lcd_display(text: string, color: string = "red"): void {
    this.lcd.setDisplay(text);
    this.lcd.options.color = color;
    this.screen.render();
  }

  set_lcd_label(label: string): void {
    this.lcd.setLabel(` ${label} `);
    this.screen.render();
  }

  clear_lcd(): void {
    this.lcd.setDisplay(" ".repeat(16));
    this.screen.render();
  }

  unmount_lcd(): void {
    // remove lcd
  }

  async type_lcd_message(message: string, speed: number = 100): Promise<void> {
    this.clear_lcd();

    //Handle long messages by splitting or truncating
    const maxLength = 16; //LCD character limit
    let displayMessage = message;

    if (message.length > maxLength) {
      return this.scroll_long_message(message, speed);
    }

    for (let i = 0; i <= displayMessage.length; i++) {
      const displayText = displayMessage.substring(0, 1).padEnd(maxLength, " ");
      this.set_lcd_display(displayText);
      await this.delay(speed);
    }
  }

  async scroll_lcd_message(
    messages: string[],
    speed: number = 300
  ): Promise<void> {
    for (const message of messages) {
      await this.type_lcd_message(message, speed);
      await this.delay(500);
    }
  }

  async scroll_long_message(
    message: string,
    speed: number = 150
  ): Promise<void> {
    const maxLength = 16;
    const padding = " ".repeat(maxLength);

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

  //loading animation on lcd
  async show_lcd_loading(duration: number = 2000): Promise<void> {
    const startTime = Date.now();
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let frameIndex = 0;

    while (Date.now() - startTime < duration) {
      const progress = Math.min(
        100,
        Math.floor(((Date.now() - startTime) / duration) * 100)
      );
      const frame = frames[frameIndex % frames.length];
      const display = `LOADING ${frame} ${progress}%`.padEnd(16, " ");

      this.set_lcd_display(display);
      frameIndex++;
      await this.delay(100);
    }

    this.set_lcd_display("COMPLETE".padEnd(16, ""));
  }

  // ***************************** ~ COMBAT ~ *************************** \\

  update_combat_screen(
    hero: Character_Hero,
    enemy: Character_Enemy,
    combatMessage: string[]
  ) {
    //Update hero panel
    this.heroPanel.setContent(
      `{bold}Name:{/bold} ${hero.name}\n` +
        `{bold}Level:{/bold} ${hero.level}\n` +
        `{bold}Health:{/bold} ${hero.health}%\n` +
        `{bold}Attack:{/bold} ${hero.attack}\n` +
        `{bold}Defense:{/bold} ${hero.defense}`
    );

    //Update enemy panel
    this.enemyPanel.setContent(
      `{bold}Name:{/bold} ${enemy.name}\n` +
        `{bold}Health:{/bold} ${enemy.health}%\n` +
        `{bold}Attack:{/bold} ${enemy.attack}\n` +
        `{bold}Defense:{/bold} ${enemy.defense}`
    );

    //Update health gauges
    this.healthGauge.setData({
      percent: hero.health,
      stroke: hero.health > 30 ? "green" : "red",
      fill: "white",
    });

    this.enemyHealthGauge.setData({
      percent: enemy.health,
      stroke: enemy.health > 30 ? "green" : "red",
      fill: "white",
    });

    //Update combat log
    this.combatLog.setContent(combatMessage.join("\n"));
    this.combatLog.setScrollPerc(100); // Scroll to bottom

    this.screen.render();
  }

  //Method to add message to combat message
  add_combat_log(message: string): void {
    this.combatLog.add(message);
    this.screen.render();
  }

  // Show/ hide combat widgets based on phase
  set_combat_visibility(visible: boolean): void {
    const widgets = [
      this.heroPanel,
      this.enemyPanel,
      this.healthGauge,
      this.enemyHealthGauge,
      this.combatLog,
    ];

    widgets.forEach((widget) => {
      if (visible) {
        widget.show();
      } else {
        widget.hide();
      }
    });

    this.screen.render();
  }

  /*=======================================================*
   |                    LAYOUTS
   *=======================================================*/

  async setLayout(layoutName: keyof typeof this.layoutConfigs): Promise<void> {
    this.clear_game_area();
    const config = this.layoutConfigs[layoutName];

    switch (layoutName) {
      case "boot":
        //@ts-expect-error
        await this.setupBootLayout(config);
        break;
      case "characterCreation":
        //@ts-expect-error
        await this.setupCharacterCreationLayout(config);
        break;
      case "worldMap":
        //@ts-expect-error
        await this.setupWorldMapLayout(config);
        break;
      case "combat":
        //@ts-expect-error
        await this.setupCombatLayout(config);
        break;
      default:
        //@ts-expect-error
        await this.setupBootLayout(config);
    }

    this.currentLayout = layoutName;
    this.screen.render();
  }

  private async setupBootLayout(config: {
    lcd: {
      top: string;
      left: string;
      width: string;
      height: number;
    };
    textArea: {
      visible: boolean;
    };
    actionBar: {
      visible: boolean;
    };
  }) {
    this.lcd.position = {
      ...config.lcd,
    };

    this.gameArea.append(this.lcd);
    this.textArea.hide();
  }

  private async setupCharacterCreationLayout(config: {
    lcd: {
      top: string;
      left: string;
      width: string;
      height: number;
    };
    textArea: {
      visible: boolean;
    };
    actionBar: {
      visible: boolean;
    };
  }) {
    this.lcd.position = {
      ...config.lcd,
    };
    this.textArea.show();
  }

  private async setupWorldMapLayout(config: {
    lcd: {
      top: string;
      left: string;
      width: string;
      height: number;
    };
    textArea: {
      visible: boolean;
    };
    actionBar: {
      visible: boolean;
    };
  }) {
    this.lcd.position = {
      ...config.lcd,
    };
  }


  async setupCombatLayout(): Promise<void> {
    // Clear any existing combat elements
    this.clearCombatElements();
    this.clear_game_area();

    // Health bars at top - using manual positioning
    this.healthGauge = blessed.box({
      ...healthGauge,
      content: this.createHealthBar("HERO", 100, "green"),
    });
    this.enemyHealthGauge = blessed.box({
      ...enemyHealthGauge,
      content: this.createHealthBar("ENEMY", 100, "red"),
    });

    // Character info panels
    this.heroPanel = blessed.box(heroPanel);
    this.enemyPanel = blessed.box(enemyPanel);

    // Combat arena (middle)
    const combatArena = blessed.box({
      ...Arena,
      content: this.renderCombatArena(),
    });

    // Combat log below arena
    this.combatLog = blessed.log(combatLog);

    // Append all combat elements
    this.gameArea.append(this.healthGauge);
    this.gameArea.append(this.enemyHealthGauge);
    this.gameArea.append(this.heroPanel);
    this.gameArea.append(this.enemyPanel);
    this.gameArea.append(combatArena);
    this.gameArea.append(this.combatLog);
  }

  private createHealthBar(
    label: string,
    percent: number,
    color: string
  ): string {
    const bars = Math.floor(percent / 10);
    const bar =
      "{" + color + "-fg}" + "█".repeat(bars) + "{/}" + "░".repeat(10 - bars);
    return `{bold}${label}:{/bold} ${bar} ${percent}%`;
  }

  private renderCombatArena(): string {
    return [
      "{bold}⚔️ COMBAT ARENA ⚔️{/bold}",
      "",
      " Hero       vs       Enemy",
      "  O                  O",
      " /|\\                /|\\",
      " / \\                / \\",
      "",
      "{yellow-fg}Choose your action!{/}",
    ].join("\n");
  }

  private clearCombatElements(): void {
    const combatElements = [
      this.healthGauge,
      this.enemyHealthGauge,
      this.heroPanel,
      this.enemyPanel,
      this.combatLog,
    ];

    combatElements.forEach((element) => {
      if (element) {
        try {
          element.detach();
        } catch (e) {
          // Element might not be attached yet
        }
      }
    });
  }

  /*=======================================================*
   |                    GAME METHODS           
   *=======================================================*/

  //Update Phase Title
  update_phase_title(title: string): void {
    const formattedTitle = `{bold}${title}{/bold}`;
    this.phaseTitle.setContent(formattedTitle);
    this.screen.render();
  }

  private get_health_bar(health: number): string {
    const bars = Math.floor(health / 10);
    const progress_characters = Game_UI.ASCII.progress_characters;

    return `{green-fg}${progress_characters["intensity_1"].repeat(
      bars
    )}{/green-fg} {red-fg}${progress_characters["intensity_4"].repeat(
      10 - bars
    )}{/red-fg}`;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  update_health(hero: Character_Hero, enemy: Character_Enemy) {
    const healthContent = `
Hero: ${this.get_health_bar(hero.health)} ${hero.health}% | Level: ${hero.level}
Enemy: ${this.get_health_bar(enemy.health)} ${enemy.health}% 
    `.trim();

    // this.healthBar.setContent(healthContent); will include this other elements later
    this.screen.render();
  }

  // UPDATE GAME AREA
  update_game_area(content: string | string[]): void {
    const contentText = Array.isArray(content) ? content.join("\n") : content;

    this.textArea.setContent(contentText);
    this.textArea.setScrollPerc(0); // Scroll to top
    this.screen.render();
  }

  // ADD LOG MESSAGE (above input)
  async add_log(message: string, speed: number = 30): Promise<void> {
    if (speed === 0) {
      this.logArea.add(message);
      this.screen.render();
      return;
    }

    // Typewriter effect for immersion
    let currentText = "";
    for (const char of message) {
      currentText += char;
      // Use setContent for typewriter, then add to log
      this.logArea.setContent(currentText);
      this.screen.render();
      await this.delay(speed);
    }
    this.logArea.add(""); // Finalize with newline
  }

  async screen_log(message: string, speed: number = 30) {
    let currentText = "";

    for (const char of message) {
      currentText += char;
      this.gameArea.setContent(currentText);
      this.screen.render();
      await this.delay(speed);
    }
  }

  //Clear the input area and set new prompt
  setInputPrompt(prompt: string = `> `) {
    this.inputArea.setValue(prompt);
    this.inputArea.focus();
    this.screen.render();
  }

  // GET INPUT (from bottom area)
  async getInput(prompt: string = "> "): Promise<string> {
    this.inputArea.setValue(prompt);
    this.inputArea.focus();
    this.screen.render();

    return new Promise((resolve) => {
      const submitHandler = (value: string) => {
        this.inputArea.removeListener("submit", submitHandler);
        this.inputArea.setValue("");
        const input = value.slice(prompt.length).trim().toUpperCase();

        // Echo input to log
        this.logArea.add(`> ${input}`);
        this.screen.render();

        resolve(input);
      };

      this.inputArea.on("submit", submitHandler);
    });
  }

  // Wait for any key (like ENTER in boot phase)
  async waitForAnyKey(): Promise<void> {
    return new Promise((resolve) => {
      const handler = () => {
        this.screen.removeListener("keypress", handler);
        resolve();
      };
      this.screen.on("keypress", handler);
    });
  }

  // Update multiple UI components at once
  updateScreen(title: string, content: string, actions: string[]) {
    this.clear_game_area();
    // this.update_game_area(this.formatScreenContent(title, content));
    this.set_lcd_display(title, "yellow");
    this.update_game_area(this.formatScreenContent(title, content));
    this.update_actions(actions);
  }

  private formatScreenContent(title: string, content: string): string {
    const Ascii_Title = `
{#daa520-fg}${
      Game_UI.ASCII.box_drawing_characters["tl"]
    }${Game_UI.ASCII.box_drawing_characters["edge_x"].repeat(
      title.length + 2
    )}${Game_UI.ASCII.box_drawing_characters["tr"]}{/#daa520-fg}
{#daa520-fg}${
      Game_UI.ASCII.box_drawing_characters["edge_y"]
    } {bold}${title}{/bold} ${
      Game_UI.ASCII.box_drawing_characters["edge_y"]
    }{/#daa520-fg}
{#daa520-fg}${
      Game_UI.ASCII.box_drawing_characters["bl"]
    }${Game_UI.ASCII.box_drawing_characters["edge_x"].repeat(
      title.length + 2
    )}${Game_UI.ASCII.box_drawing_characters["br"]}{/#daa520-fg}
    `;
    return `${Ascii_Title}\n\n${content}`;
  }

  // UPDATE ACTIONS (bottom left)
  update_actions(actions: string[]): void {
    const actionText = actions.join("  |  ");
    this.actionBar.setContent(actionText);
    this.screen.render();
  }

  // CLEAR METHODS
  clear_game_area(): void {
    this.gameArea.setContent(""); // clear game area
    this.textArea.setContent(""); // clear textArea (game area childnode)
    this.screen.render();
  }

  clear_log(): void {
    this.logArea.setContent("");
    this.screen.render();
  }

  async setupPlatformerLayout(): Promise<void> {
    this.textArea.position = {
      top: 1,
      left: "center",
      //@ts-expect-error
      width: 42, // Fixed width for game area
      height: 22, // Fixed height
      border: { type: "line", fg: "blue" },
    };

    this.actionBar.position = {
      top: 24,
      left: 0,
      //@ts-expect-error

      width: "100%",
      height: 3,
    };

    this.logArea.position = {
      top: 28,
      left: 0,
      //@ts-expect-error

      width: "100%",
      height: "10%",
    };

    this.gameArea.append(this.textArea);
    this.textArea.show();
    this.actionBar.show();
    this.logArea.show();
    this.lcd.hide();
  }
}


interface Enemy {
  x: number;
  y: number;
  symbol: string;
  health: number;
  type: "patrol" | "shooter" | "boss";
  patrolRange: number;
  direction: number;
}

// class EnemyAI {
//   static updateEnemy(enemy: Enemy, player: Player, world: WorldLevel): void {
//     switch (enemy.type) {
//       case "patrol":
//         this.patrolBehavior(enemy, world);
//         break;
//       case "shooter":
//         this.shooterBehavior(enemy, player);
//         break;
//     }
//   }

//   private static patrolBehavior(enemy: Enemy, world: WorldLevel): void {
//     const newX = enemy.x + enemy.direction;

//     if (!world.tiles[Math.floor(enemy.y)][Math.floor(newX)]?.solid) {
//       enemy.x = newX;
//     } else {
//       enemy.direction *= -1;
//     }
//   }

//   private static shooterBehavior(enemy: Enemy, player: Player): void {
//     // Simple shooting logic - could shoot projectiles at player
//     if (Math.abs(enemy.x - player.x) < 10) {
//       // Enemy would shoot here
//     }
//   }
// }



//amnesty

export { Game_UI };

