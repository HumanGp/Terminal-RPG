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
  FOREST_AREA: string;
  BUG_INFESTED_CAVES: string;
  GLITCH_CANYON: string;
  KERNEL_CITADEL: string;
};

interface TextArea {
  visible: boolean;
  top?: number | string;
  left?: number | string;
  height?: string | number;
  width?: string | number;
}

interface LCD {
  top: string | number;
  left: string | number;
  width: string | number;
  height: number | string;
  visible?: boolean;
}

interface ActionBar {
  visible: boolean
}

interface LogArea {
  visible: boolean
}


export interface LayoutConfig {
  boot: {
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
    logArea: {
      visible: boolean;
    };
  };
  characterCreation: {
    lcd: {
      top: number;
      left: string;
      width: string;
      height: number;
    };
    textArea: {
      top: number;
      left: number;
      width: string;
      height: string;
      visible: boolean;
    };
    actionBar: {
      visible: boolean;
    };
    logArea: {
      visible: boolean;
    };
  };

  worldMap: {
    lcd: LCD;
    textArea: TextArea;
    actionBar: ActionBar;
    logArea: LogArea;
  };

  combat: {
    lcd: LCD;
    textArea: TextArea;
    actionBar: ActionBar;
    logArea: LogArea;
    combatElements: { visible: boolean };
  };
}

export type {
  UI_,
  ASCII_Characters,
  GamePhase,
  ScreenData,
  ARTS
};
