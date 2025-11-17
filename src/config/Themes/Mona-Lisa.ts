import { TerminalTheme } from "../../types/theme_types";

const MonaLisa: TerminalTheme = {
  colors: {
    primary: "#d4af37", 
    secondary: "#8b4513", 
    accent: "#b22222", 
    background: "#2a1f1d", 
    text: "#e8d8b5", 
    muted: "#a08c76", 
    highlight: "#daa520", 
  },

  styles: {
    screen: {
      bg: "#2a1f1d", 
      fg: "#312b1dff", 
    },
    title: {
      fg: "#d4af37", 
      bg: "#3a2a25", 
      bold: true,
    },
    health: {
      fg: "#b22222", 
      bg: "#2a1f1d",
      border: { fg: "#8b4513" }, 
    },
    gameArea: {
      fg: "#151312c9", 
      bg: "#dde3d9f6",
      border: { fg: "#8b4513" },
      scrollbar: { bg: "#d4af37" },
    },
    actions: {
      fg: "#daa520", 
      bg: "#3a2a25",
      border: { fg: "#d4af37" },
    },
    log: {
      fg: "#a08c76", 
      bg: "#2a1f1d",
      border: { fg: "#8b4513" },
    },
    input: {
      fg: "#e8d8b5", 
      bg: "#3a2a25", 
      border: { fg: "#d4af37" },
      focus: { bg: "#4a3a35" },
    },
  },
};

export { MonaLisa };
