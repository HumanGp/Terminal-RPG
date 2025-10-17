interface ASCII_Characters {
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
}

interface UI_ {
    
}

type GamePhase =
  | "BOOT"
  | "CHARACTER_CREATION"
  | "WORLD_MAP"
  | "COMBAT"
  | "INVENTORY"
  | "SHOP"
  | "GAME_OVER";

interface ScreenData {
  title: string;
  content: string[];
  actions: string[];
  asciiArt: string;
}

type ARTS = {
  CORRUPTED_FOREST: string;
  BUG_INFESTED_CAVES: string;
  GLITCH_CANYON: string;
  KERNEL_CITADEL: string;
};


export type {
  UI_,
  ASCII_Characters,
  GamePhase,
  ScreenData,
  ARTS
};
