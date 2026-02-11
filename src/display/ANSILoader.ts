/**
 * This class is a template for an ASCII art formater
 * uses a desired config to colorize an art for rendering
 */

export class ANSILoader {

  constructor(
    private art: string[],
    private config: { [i: string]: string }
  ) { }
    
  private parseCharacterArt(): string[] {
    return this.art.map((line) => this.colorizeLine(line));
  }

  /**
   *
   * @param line - line is string (one of the elements in the string[])
   * (\S) - Captures any non-space character
   * (\1*) - Captures 0 or more repetitions of that same character (using backreference \1)
   * /g - Global flag to find all matches
   * Automatic grouping: finds sequenses like ≈≈≈≈≈≈ in single passes
   * Smart coloring: Uses the first character of each sequence to determine the color
   * Space handling: Naturally ignores spaces since \S only matches non-space characters
   * Fallback system: Any unconfigured character gets the default color
   * @returns string
   */
  private colorizeLine(line: string): string {
    return line.replace(/(\S)(\1*)/g, (match, firstChar) => {
      const color = this.config[firstChar] || "yellow";
      return `{${color}-fg}${match}{${color}-fg}`;
    });
  }

  public getFormattedArt(): string[] {
    return this.parseCharacterArt();
  }

  public printFormatedArt(): void {
    const formatted = this.getFormattedArt();
    formatted.forEach((line) => console.log(line));
  }
}


