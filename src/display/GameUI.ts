import { BlessedProgram, Widgets } from "blessed";
import { Character_Enemy, Character_Hero } from "../types/characters_types";
import { ASCII_Characters } from "../types/UI_types";

var blessed = require('blessed');
var contrib = require('blessed-contrib')

class Typewriter {
  static async type(text: string, speed: number = 50, screen?: boolean) {   
    if (screen) {
      
    } else {
      //conditional blocks on where the effect should take place log_area
      for (let i = 0; i < text.length; i++) {
        process.stdout.write(text[i] as string);
        await this.delay(speed);
      }
      process.stdout.write('\n');
    }
  }

    private static delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
  
}

class Game_UI {
  private screen: Widgets.Screen;
  private healthBar: Widgets.BoxElement;
  private gameArea: Widgets.BoxElement;
  private logArea: Widgets.Log;
  private phaseTitle: Widgets.Log;
  private inputArea: Widgets.TextboxElement; 
  private actionBar: Widgets.BoxElement;
  static ASCII: ASCII_Characters = {
    box_drawing_characters: {
      tl: "╔",
      tr: "╗",
      br: "╝",
      bl: "╚",
      joint_center: "╬",
      joint_l: "╠",
      joint_r: "╣",
      edge_y: "║",
      edge_x: "═",
    },

    progress_characters: {
      intensity_1: "█",
      intensity_2: "▓",
      intensity_3: "▒",
      intensity_4: "░",
    },
  };

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "Terminal RPG",
      cursor: {
        artificial: true,
        shape: "line",
        blink: true,
      },
    });

    //health_bar
    this.healthBar = blessed.box({
      top: 0,
      left: 0,
      width: "20%",
      height: 3,
      content: `${this.get_health_bar(100)}`,
      border: { type: "line" },
      style: {
        border: { fg: "cyan" },
        fg: "white",
      },
    });

    // Game Area (Dynamic content)
    this.gameArea = blessed.box({
      top: 1, //Below title
      left: 0,
      width: "100%",
      height: "70%",
      content: "Welcome to your adventure...",
      tags: true,
      styles: {
        fg: "#e8d8b5",
        bg: "#2a1f1d",
      },
      border: {
        type: "line",
        fg: "#8b4513",
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: " ",
        style: { bg: "#d4af37" },
      },
      padding: { left: 2, right: 2, top: 1, bottom: 1 },
    });

    //Log Area (scrolls, doesn't grow)
    this.logArea = blessed.log({
      top: "70%+4", // Below action bar
      left: 0,
      width: "100%",
      height: "20%", // Reasonable height for messages
      style: {
        fg: "#a08c76",
        bg: "#2a1f1d",
      },
      border: {
        type: "line",
        fg: "#8b4513",
      },
      scrollback: 100,
      scrollbar: {
        ch: "░",
        style: { fg: "#d4af37" },
      },
    });

    // INPUT AREA - Always at very bottom
    this.inputArea = blessed.textbox({
      bottom: 0,
      left: 0,
      width: "100%",
      height: 3,
      style: {
        fg: "#e8d8b5",
        bg: "#3a2a25",
      },
      border: {
        type: "line",
        fg: "#d4af37", // Gold border
      },
      inputOnFocus: true,
      padding: { left: 1 },
    });

    this.phaseTitle = blessed.box({
      top: 0,
      left: "center",
      width: "100%",
      height: 1,
      content: "{bold}TERMINAL RPG{/bold}",
      tags: true,
      style: {
        fg: "#d4af37",
        bg: "#2a1f1d",
        bold: true,
      },
      align: "center",
    });

    this.actionBar = blessed.box({
      top: "70%+1",
      left: 0,
      width: "100%",
      height: 3,
      content: "Actions will appear here...",
      style: {
        fg: "#daa520",
        bg: "#2a1f1d",
      },
      border: {
        type: "line",
        fg: "#d4af37",
      },
      padding: { left: 2 },
    });

    this.screen.append(this.phaseTitle);
    this.screen.append(this.gameArea);
    this.screen.append(this.actionBar);
    this.screen.append(this.logArea);
    this.screen.append(this.inputArea);
  }

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

    this.healthBar.setContent(healthContent);
    this.screen.render();
  }

  // UPDATE GAME AREA (main content)
  update_game_area(content: string | string[]): void {
    const contentText = Array.isArray(content) ? content.join("\n") : content;
    this.gameArea.setContent(contentText);
    this.gameArea.setScrollPerc(0); // Scroll to top
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
    this.update_game_area(this.formatScreenContent(title, content));
    this.update_actions(actions);
  }

  private formatScreenContent(title: string, content: string): string {
    return `{bold}${title}{/bold}\n\n${content}`;
  }

  // UPDATE ACTIONS (bottom left)
  update_actions(actions: string[]): void {
    const actionText = actions.join("  |  ");
    this.actionBar.setContent(actionText);
    this.screen.render();
  }

  // CLEAR METHODS
  clear_game_area(): void {
    this.gameArea.setContent("");
    this.screen.render();
  }

  clear_log(): void {
    this.logArea.setContent("");
    this.screen.render();
  }
}



export { Game_UI };
  

