/**
 * UI TERMINAL
 */

import { Enemy } from "../characters/Enemy.js";
import { Hero } from "../characters/Hero.js";
import type { Character_Enemy, Character_Hero } from "../types/characters_types.js";
import type { Battle_Log } from "../types/combat_types.js";
import type { ASCII_Characters, UI_ } from "../types/UI_types.js";

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

class UI implements UI_ {
  static  display_battle(hero: Character_Hero, enemy: Character_Enemy, battle_log: Battle_Log) {
  
    const character_health_ascii = (character: Character_Hero | Character_Enemy) =>
      `${character.name}: ${ASCII.progress_characters["intensity_1"].repeat(
        character.health / 10
      )}${ASCII.progress_characters["intensity_4"].repeat(
        10 - character.health / 10
      )} ${character.health}%`;
    
/**
 * 
 * @param array - takes in an array of numbers | strings
 * @returns number - The max number in a in an array
 */
    const get_max = (array: number[] | string[]):number => {
      return array.reduce((currentMax: number, element: number | string) => {
        if (typeof element === 'string') {
          return Math.max(currentMax, element.length);
        }
        return Math.max(currentMax, element)
      }, -Infinity)
    }

    const intro_message: string = "⚔️ BATTLE! ⚔️";
    const hero_status = character_health_ascii(hero);
    const enemy_status = character_health_ascii(enemy);
    const battle_log_max = battle_log ? get_max(battle_log) : 0;

// edge_length is determined by the longest message logged in the terminal
    const edge_length = get_max([
      intro_message.length,
      hero_status.length,
      enemy_status.length,
      battle_log_max as number,
    ]);

// This is the ASCII container holding the terminal messages
    const message_box =
`
${ASCII.box_drawing_characters["tl"]}${ASCII.box_drawing_characters["edge_x"].repeat(edge_length)}${ASCII.box_drawing_characters["tr"]}
${ASCII.box_drawing_characters["edge_y"]}${intro_message}${ASCII.box_drawing_characters["edge_y"]}
${ASCII.box_drawing_characters["joint_l"]}${ASCII.box_drawing_characters["edge_x"].repeat(edge_length)}${ASCII.box_drawing_characters["joint_r"]}
${ASCII.box_drawing_characters["edge_y"]}${hero_status}${ASCII.box_drawing_characters["edge_y"]}
${ASCII.box_drawing_characters["edge_y"]}${enemy_status}${ASCII.box_drawing_characters["edge_y"]}
${battle_log.length > 0 ? battle_log.forEach(log => (
  `${ASCII.box_drawing_characters['edge_y']} ${log} ${ASCII.box_drawing_characters['edge_y']}`
)) : ""
}    
${ASCII.box_drawing_characters["bl"]}${ASCII.box_drawing_characters["edge_x"].repeat(edge_length)} ${ASCII.box_drawing_characters["br"]}
`
;
  console.log(message_box);
  }


  static display_menu() {
    console.log(`[A]ttack [H]ealth [R]un\n Choose an action`);
  }
  get(){}
}

export { UI };

const hero = new Hero('HumanGpt');
const enemy = new Enemy('Mr robot');  

UI.display_battle(hero,enemy,['Nigga Got shot in the ass'])