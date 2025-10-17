/**
 * UI TERMINAL
 */

// import { title } from "process";
import { Enemy } from "../characters/Enemy";
import { Hero } from "../characters/Hero";
var blessed = require('blessed')
var contrib = require('blessed-contrib')

import type { Character_Enemy, Character_Hero } from "../types/characters_types";
import type { Battle_Log } from "../types/combat_types";
import type { ASCII_Characters, UI_ } from "../types/UI_types";


// ASCII CHARACTERS
const ASCII: ASCII_Characters = {
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

const screen = blessed.screen({
  smartCSR: true,
  title: 'Terminal RPG'
});

const healthBar = blessed.box({
  top: 0,
  left: 0,
  width: "100%",
  height: 3,
  content: "Health: ██████████ 100% ",
});

const game

class UI implements UI_ {
  static display_battle( hero: Character_Hero, enemy: Character_Enemy, battle_log: Battle_Log ) {
    
    const character_health_ascii = (character: Character_Hero | Character_Enemy) =>
` ${character.name}: ${ASCII.progress_characters["intensity_1"].repeat(Math.max(0, Math.floor(character.health / 10))
      )}${ASCII.progress_characters["intensity_4"].repeat(
        Math.max(0, 10 - Math.floor(character.health / 10))
      )} ${character.health}%`;

    /**
     *
     * @param array - takes in an array of numbers | strings
     * @returns number - The max number in a in an array
     */
    const get_max = (array: (number | string)[]): number => {
      const lengths = array.map((item) =>
        typeof item === "string" ? item.length : item
      );

      return Math.max(...lengths, 0);
    };

    const intro_message: string = "⚔️ BATTLE! ⚔️";
    const hero_status = character_health_ascii(hero);
    const enemy_status = character_health_ascii(enemy);

    const all_content: (string | number)[] = [
      intro_message,
      hero_status,
      enemy_status,
      ...battle_log,
    ];

    const edge_length = get_max(all_content);

    // Helper function to center text with proper padding
    const center_text = (text: string, width: number): string => {
      const padding = Math.max(0, width - text.length);
      const left_padding = Math.floor(padding / 2);
      const right_padding = padding - left_padding;
      return " ".repeat(left_padding) + text + " ".repeat(right_padding);
    };

    // Helper function to create a line with left-aligned text and proper spacing
    const create_line = (text: string, width: number): string => {
      const padding = Math.max(0, width - text.length);
      return text + " ".repeat(padding);
    };

    // Build the message box
    let message_box =
      `${ASCII.box_drawing_characters["tl"]}${ASCII.box_drawing_characters[
        "edge_x"
      ].repeat(edge_length)}${ASCII.box_drawing_characters["tr"]}\n` +
      `${ASCII.box_drawing_characters["edge_y"]}${center_text(
        intro_message,
        edge_length
      )}${ASCII.box_drawing_characters["edge_y"]}\n` +
      `${ASCII.box_drawing_characters["joint_l"]}${ASCII.box_drawing_characters[
        "edge_x"
      ].repeat(edge_length)}${ASCII.box_drawing_characters["joint_r"]}\n` +
      `${ASCII.box_drawing_characters["edge_y"]}${create_line(
        hero_status,
        edge_length
      )}${ASCII.box_drawing_characters["edge_y"]}\n` +
      `${ASCII.box_drawing_characters["edge_y"]}${create_line(
        enemy_status,
        edge_length
      )}${ASCII.box_drawing_characters["edge_y"]}\n` +
      // Separator between health and battle logs
      `${ASCII.box_drawing_characters["joint_l"]}${ASCII.box_drawing_characters[
        "edge_x"
      ].repeat(edge_length)}${ASCII.box_drawing_characters["joint_r"]}\n`;

    // Add battle logs or empty line if no logs
    if (battle_log.length > 0) {
      battle_log.forEach((log) => {
        message_box += `${ASCII.box_drawing_characters["edge_y"]}${create_line(
          ` ${log}`,
          edge_length
        )}${ASCII.box_drawing_characters["edge_y"]}\n`;
      });
    } else {
      message_box += `${ASCII.box_drawing_characters["edge_y"]}${" ".repeat(
        edge_length
      )}${ASCII.box_drawing_characters["edge_y"]}\n`;
    }

    // Close the box
    message_box += `${
      ASCII.box_drawing_characters["bl"]
    }${ASCII.box_drawing_characters["edge_x"].repeat(edge_length)}${
      ASCII.box_drawing_characters["br"]
    }`;

    console.log(message_box);
  }

  static display_menu() {
    console.log(`[A]ttack [H]ealth [R]un\n Choose an action`);
  }

}

export { UI };
