interface TerminalTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    highlight: string;
  };
  styles: {
    [key: string]: any;
  };
}

export type { TerminalTheme };
