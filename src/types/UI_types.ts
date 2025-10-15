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

export type { UI_ , ASCII_Characters };
