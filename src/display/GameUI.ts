import { BlessedProgram, Widgets } from "blessed";
import { Character_Enemy, Character_Hero } from "../types/characters_types";
import { ASCII_Characters } from "../types/UI_types";

var blessed = require('blessed');
var contrib = require('blessed-contrib')

class Typewriter {
   static async type(text: string, speed: number = 50) {   
     //conditional blocks on where the effect should take place log_area
      for (let i = 0; i < text.length; i++) {
        process.stdout.write(text[i] as string);
        await this.delay(speed);
      }
      process.stdout.write('\n');
   }

    private static delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
  
}

class Game_UI {
  private screen: Widgets.Screen; // blessed.Widgets.Screen;
  private healthBar: Widgets.BoxElement; //blessed.Widgets.BoxElement;
  private gameArea: Widgets.BoxElement; //blessed.Widgets.BoxElement;
  private logArea: Widgets.Log; //blessed.Widget.log;
  private inputArea: Widgets.TextboxElement; //blessed.Widgets.TextboxElement;
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
      width: "100%",
      height: 3,
      content: "",
      border: { type: "line" },
      style: {
        border: { fg: "cyan" },
        fg: "white",
      },
    });

    // Game Area (Dynamic content)
    this.gameArea = blessed.box({
      top: 3,
      left: 0,
      width: "100%",
      height: "60%",
      content: "Battle will appear here ...",
      style: { fg: "green" },
    });

    //Log Area (scrolls, doesn't grow)
    this.logArea = blessed.log({
      top: "60%",
      left: 0,
      width: "100%",
      height: "25%",
      border: { type: "line" },
      style: {
        border: { fg: "yellow" },
        fg: "white",
      },
      scrollback: 100, // keep history but don't show all
      scrollbar: {
        ch: " ",
        inverse: true,
      },
    });

    // Input Area (Always at bottom)
    this.inputArea = blessed.textbox({
      bottom: 0,
      left: 0,
      width: "100%",
      height: 3,
      style: {
        fg: "white",
        bg: "blue",
      },
      inputOnFocus: true,
    });

    this.screen.append(this.healthBar);
    this.screen.append(this.gameArea);
    this.screen.append(this.logArea);
    this.screen.append(this.inputArea);
  }

  private get_health_bar(health: number): string {
    const bars = Math.floor(health / 10);

    return (
      "{/green-fg}" +
      `${Game_UI.ASCII.progress_characters["intensity_1"]}`.repeat(bars) +
      "{/green-fg}" +
      "{red-fg}" +
      `${Game_UI.ASCII.progress_characters["intensity_4"]}`.repeat(10 - bars) +
      "{/red-fg}"
    );
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

  update_game_area(content: string) {
    this.gameArea.setContent(content);
    this.screen.render();
  }

  async add_log(message: string, speed: number = 30) {
    await Typewriter.type(message, speed);
  }


  //Clear the input area and set new prompt
  setInputPrompt(prompt: string = `> `) {
    this.inputArea.setValue(prompt);
    this.inputArea.focus();
    this.screen.render();
  }

  // Get input with proper scoping
  async getInput(prompt: string = `> `): Promise<string> {
    this.setInputPrompt(prompt);
    
    return new Promise((resolve) => {
      const submitHandler = (value: string) => {
        this.inputArea.removeListener('submit', submitHandler);
        this.inputArea.setValue("");
        resolve(value.slice(prompt.length).trim().toUpperCase());
      };
      
      this.inputArea.on('submit', submitHandler);
    });
  }

  // Wait for any key (like ENTER in boot phase)
  async waitForAnyKey(): Promise<void> {
    return new Promise((resolve) => {
      const handler = () => {
        this.screen.removeListener('keypress', handler);
        resolve();
      };
      this.screen.on('keypress', handler);
    });
  }

  // Update multiple UI components at once
  updateScreen(title: string, content: string, actions: string[]) {
    this.update_game_area(this.formatScreenContent(title, content));
    this.update_actions(actions);
  }

  private formatScreenContent(title: string, content: string): string {
    return `{bold}${title}{/bold}\n\n${content}`;
  }

  update_actions(actions: string[]) {
    // You might want to display actions in a specific area
    // For now, we'll include them in the log or a separate area
    const actionsText = `Actions: ${actions.join(' | ')}`;
    this.logArea.add(actionsText);
    this.screen.render();
  }

  wait_for_continue() {
    
  }
}



export { Game_UI };
  

