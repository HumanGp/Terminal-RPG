/*=======================================================*
 |             UI COMPONENTS OBJECT                      |
 *=======================================================*/

import { Game_UI } from "../../display/GameUI";
import { UIConfig } from "../../types/UI_types";

 // *********** ~ main screen components ~ **************

export const screen = {
  smartCSR: true,
  title: "Terminal RPG",
  cursor: {
    artificial: true,
    shape: "line",
    blink: true,
  },
};

export const phaseTitle = {
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
};

export const gameArea = {
  top: 1, //Below title
  left: 0,
  width: "100%",
  height: "85%",
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
  label: "Screen",
};


export const actionBar = {
  bottom: 0,
  right: 0,
  width: "30%",
  height: 3,
  content: "booting...",
  style: {
    fg: "#daa520",
    bg: "#2a1f1d",
  },
  border: {
    type: "line",
    fg: "#d4af37",
  },
  padding: { left: 2 },
  label: "{ Commands }",
};

export const logArea = {
  top: 0, // Below action bar
  right: 0,
  width: "30%",
  height: "30%", // Reasonable height for messages
  style: {
    fg: "#a08c76",
    // bg: "#2a1f1d",
  },
  // border: {
  //   type: "line",
  //   fg: "#8b4513",
  // },
  scrollback: 100,
  scrollbar: {
    ch: "░",
    style: { fg: "#d4af37" },
  },
  label: "{ Logs }",
  padding: { left: 2, right: 2, top: 1, bottom: 1 },
};

export const inputArea = {
  top: "86%+3",
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
  label: "Input",
};

// *********** ~ sub components ~ *************

export const lcd = {
  segmentWidth: 0.06, // Width of each segment
  segmentInterval: 0.11, // Space between segments
  strokeWidth: 0.1, // Thickness of segments
  elements: 16, // Number of character elements
  display: "", // Initial display content
  elementSpacing: 4, // Spacing between elements
  elementPadding: 1, // Padding around elements
  color: "yellow", // LCD color (green, red, blue, etc.)
  // label: "LCD",
  // border: { type: "line", fg: "cyan" },
  height: 6,
  top: "0%", 
  left: 0,
  
  width: "90%",
};

export const textArea = {
  top: 0,
  left: 0,
  width: "65%",
  height: "100%",
  content: "",
  tags: true,
  styles: {
    fg: "#e8d8b5",
    bg: "#2a1f1d",
  },
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: "░",
    style: { bg: "#d4af37" },
  },
  keys: true, // keyboard scrolling
  vi: true, // vi keys for scrolling
  mouse: true, // mouse scrolling
  padding: { top: 0 },
};

// ******** ~ combat screen components ~ **********

export const healthGauge = {
  top: 1,
  left: 0,
  width: "50%",
  height: 3,
  tags: true,
  border: { type: "line", fg: "green" },
  style: { fg: "white", bg: "#1f2a1f" },
};

export const enemyHealthGauge = {
  top: 1,
  left: "50%",
  width: "50%",
  height: 3,
  tags: true,
  border: { type: "line", fg: "red" },
  style: { fg: "white", bg: "#2a1f1f" },
};

export const heroPanel = {
  top: 5,
  left: 0,
  width: "25%",
  height: 8,
  content: "{bold}HERO{/bold}\n\nReady for battle!",
  tags: true,
  border: { type: "line", fg: "blue" },
  style: { fg: "white", bg: "#1f1f2a" },
};

export const enemyPanel = {
  top: 5,
  left: "75%",
  width: "25%",
  height: 8,
  content: "{bold}ENEMY{/bold}\n\nWaiting...",
  tags: true,
  border: { type: "line", fg: "red" },
  style: { fg: "white", bg: "#2a1f1f" },
};

export const combatLog = {
  top: 14,
  left: 0,
  width: "100%",
  height: "70%-14",
  content: "Combat started!\n",
  tags: true,
  border: { type: "line", fg: "cyan" },
  style: { fg: "white", bg: "#1f2a2a" },
  scrollable: true,
  scrollback: 100,
};

export const Arena = {
  top: 5,
  left: "25%",
  width: "50%",
  height: 8,
  tags: true,
  border: { type: "line", fg: "yellow" },
  style: { fg: "white", bg: "#2a2a1f" },
  align: "center",
};

export const ASCII = {
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
} as const;

/*=======================================================*
 |                   LAYOUTS                             |
 *=======================================================*/

export const layoutConfigs: UIConfig = {
  boot: {
    lcd: {
      top: "center",
      left: "center",
      width: "90%",
      height: 6,
      visible: true
    },
    textArea: { visible: false },
    actionBar: { visible: true },
    logArea: { visible: true },
    
  },

  character_creation: {
    lcd: { top: 1, left: "center", width: "90%", height: 4 },
    textArea: {
      top: 6,
      left: 0,
      width: "100%",
      height: "70%-6",
      visible: true,
    },
    actionBar: { visible: false },
    logArea: { visible: true },
  },
  world_map: {
    lcd: { top: 1, left: "center", width: "90%", height: 4 },
    textArea: {
      top: 6,
      left: 0,
      width: "100%",
      height: "70%-6",
      visible: true,
    },
    actionBar: { visible: true },
    logArea: { visible: true },
  },
  combat: {
    textArea: {
      top: 1,
      left: "center",
      width: 42,
      height: 22,
      border: {type: "line", fg: "blue"}
    },
    actionBar: {
      top: 24,
      left: 0,
      width: "100%",
      height: 3,
    },
    logArea: {
      top: 28,
      left: 0,
      width: "100%",
      height: "10%"
    }
  },
};