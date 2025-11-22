import { Game_UI } from "./GameUI";

class ANSIRenderer {
    static renderArt(art: string[], x: number, y: number, ui: Game_UI): void {
        // Since blessed supports ANSI colors, we can directly use these
        for (let i = 0; i < art.length; i++) {
            // We need to position this art in the game area
            // This is tricky because each line has its own positioning
            const line = art[i];
            
            // For now, let's add it to the game area content
            // We'll need to handle positioning more carefully
            this.addANSIString(ui, line, x, y + i);
        }
    }
    
    private static addANSIString(ui: Game_UI, ansiString: string, x: number, y: number): void {
        // Blessed supports ANSI colors, but positioning is the challenge
        // One approach: build the entire screen as ANSI art
        const currentContent = ui.textArea.getContent();
        const lines = currentContent.split('\n');
        
        // Ensure we have enough lines
        while (lines.length <= y) {
            lines.push('');
        }
        
        // Insert the ANSI art at the correct position
        // This is simplified - you'd need more sophisticated line manipulation
        lines[y] = ansiString;
        
        ui.textArea.setContent(lines.join('\n'));
    }
    
    // Alternative: Create a composite display
    static createCompositeScene(background: string[], characters: Array<{art: string[], x: number, y: number}>): string[] {
        const scene: string[] = [];
        const height = background.length;
        
        for (let y = 0; y < height; y++) {
            let line = '';
            
            // Start with background
            if (y < background.length) {
                line = background[y];
            }
            
            // Overlay characters
            for (const char of characters) {
                if (y >= char.y && y < char.y + char.art.length) {
                    const artLine = char.art[y - char.y];
                    // This is complex - you'd need to replace specific positions
                    // For now, we'll just append (not ideal)
                    line += ' ' + artLine;
                }
            }
            
            scene.push(line);
        }
        
        return scene;
    }
}






// SimpleANSIGame.ts
class SimpleANSIGame {
    private ui: Game_UI;
    
    async showCharacterArt(character: string, art: string[]): Promise<void> {
        // Clear and show the art centered
        await this.ui.clear_game_area();
        
        const centeredArt = this.centerArt(art);
        this.ui.update_game_area(centeredArt.join('\n'));
        
        await this.ui.add_log(`Showing: ${character}`);
    }
    
    private centerArt(art: string[]): string[] {
        // Find the maximum line length to center properly
        const maxLength = Math.max(...art.map(line => {
            // Remove ANSI codes to get actual visible length
            const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
            return cleanLine.length;
        }));
        
        const terminalWidth = 80; // Adjust based on your terminal
        const padding = Math.max(0, Math.floor((terminalWidth - maxLength) / 2));
        
        return art.map(line => ' '.repeat(padding) + line);
    }
    
    async createCharacterSelection(): Promise<void> {
        const characters = [
            { name: 'PIRATE', art: CharacterArt.PIRATE },
            { name: 'HERO', art: CharacterArt.HERO },
            // ... other characters
        ];
        
        for (const char of characters) {
            await this.showCharacterArt(char.name, char.art);
            await this.ui.add_log("Press any key for next character...");
            await this.ui.waitForAnyKey();
        }
    }
}

// ANSICombat.ts
class ANSICombat {
    static createCombatScene(heroArt: string[], enemyArt: string[], heroHealth: number, enemyHealth: number): string {
        // Create a simple side-by-side display
        const maxHeight = Math.max(heroArt.length, enemyArt.length);
        let combatDisplay = '';
        
        combatDisplay += '{bold}COMBAT!{/bold}\n\n';
        
        // Health bars
        combatDisplay += `HERO: [${this.getHealthBar(heroHealth)}] ${heroHealth}%`;
        combatDisplay += ' '.repeat(20);
        combatDisplay += `ENEMY: [${this.getHealthBar(enemyHealth)}] ${enemyHealth}%\n\n`;
        
        // Character art side by side
        for (let i = 0; i < maxHeight; i++) {
            const heroLine = i < heroArt.length ? heroArt[i] : '';
            const enemyLine = i < enemyArt.length ? enemyArt[i] : '';
            
            // Pad lines to make them align
            const heroPadding = 30 - this.getVisibleLength(heroLine);
            combatDisplay += heroLine + ' '.repeat(heroPadding) + enemyLine + '\n';
        }
        
        return combatDisplay;
    }
    
    private static getHealthBar(health: number): string {
        const bars = Math.floor(health / 10);
        return '█'.repeat(bars) + '░'.repeat(10 - bars);
    }
    
    private static getVisibleLength(ansiString: string): number {
        // Remove ANSI escape codes to get visible character count
        return ansiString.replace(/\x1b\[[0-9;]*m/g, '').length;
    }
}


// In your game
const game = new SimpleANSIGame();

// Show character selection
await game.createCharacterSelection();

// Show combat
const combatScene = ANSICombat.createCombatScene(
    CharacterArt.PIRATE,
    CharacterArt.ENEMY, 
    80,
    60
);

ui.update_game_area(combatScene);

// quick fix - remove all bg codes
function removeBackgroundColors(ansiString: string): string {
  // Remove all 48;5;XX background color codes
  return ansiString.replace(/;48;5;\d+/g, "");
}

// Usage:
const cleanLine = removeBackgroundColors(ansiLine);

// more precise - replacewith default bg
function normalizeBackground(
  ansiString: string,
  defaultBg: number = 0
): string {
  // Replace all background colors with default (0 = black)
  return ansiString.replace(/;48;5;\d+/g, `;48;5;${defaultBg}`);
}

//better - preserve foreground, fix bg
function cleanANSIArt(ansiString: string): string {
  return (
    ansiString
      // Keep foreground colors (38;5;XX)
      // But normalize background to terminal default
      .replace(/\x1b\[38;5;(\d+);48;5;(\d+)m/g, "\x1b[38;5;$1m")
      // Remove standalone background codes
      .replace(/\x1b\[48;5;\d+m/g, "")
      // Ensure each line ends with reset
      .replace(/\x1b\[m$/, "") + "\x1b[m"
  );
}

//batch cleaner for the entire art
function cleanAllANSIArt(artArray: string[]): string[] {
  return artArray.map((line) => {
    // Remove all background color codes but keep foreground
    let clean = line.replace(/;48;5;\d+/g, "");

    // Fix any broken ANSI sequences
    clean = clean.replace(/\x1b\[38;5;(\d+)m/g, "\x1b[38;5;$1m");

    // Ensure proper reset at end
    if (!clean.endsWith("\x1b[m")) {
      clean += "\x1b[m";
    }

    return clean;
  });
}

// Usage:
const cleanPirate = cleanAllANSIArt(ANSICharacters.PIRATE);


// Terminal-Friendly version
function makeTerminalCompatible(ansiString: string): string {
  return (
    ansiString
      // Convert to basic 16 colors for better compatibility
      .replace(/38;5;(\d+)/g, (match, colorCode) => {
        const color = parseInt(colorCode);
        // Map to basic terminal colors
        if (color >= 232) return "37"; // white/gray
        if (color >= 16) return "33"; // yellow/brown
        return colorCode;
      })
      // Remove all background codes
      .replace(/;48;5;\d+/g, "")
      // Remove standalone background sets
      .replace(/\x1b\[48;5;\d+m/g, "")
  );
}


//Progressive cleaning
// Try different cleaning levels until it looks good
function progressiveClean(ansiArray: string[]): string[] {
    const attempts = [
        // Level 1: Just remove backgrounds
        ansiArray.map(line => line.replace(/;48;5;\d+/g, '')),
        
        // Level 2: Remove backgrounds and fix sequences
        ansiArray.map(line => line
            .replace(/;48;5;\d+/g, '')
            .replace(/\x1b\[38;5;(\d+)m/g, '\x1b[38;5;$1m')
        ),
        
        // Level 3: Convert to basic colors
        ansiArray.map(line => line
            .replace(/38;5;(\d+)/g, (match, color) => {
                const c = parseInt(color);
                return c > 200 ? '37' : c > 100 ? '33' : '32';
            })
            .replace(/;48;5;\d+/g, '')
        )
    ];
    
    // Test each attempt and return the best one
    return attempts[1]; // Usually level 2 works best
}


//testing
// Quick test with your pirate
const testLines = [
    ANSICharacters.PIRATE[0], // First line
    ANSICharacters.PIRATE[1], // Second line  
    ANSICharacters.PIRATE[2]  // Third line
];

const cleaned = testLines.map(line => 
    line.replace(/;48;5;\d+/g, '')
        .replace(/\x1b\[48;5;\d+m/g, '')
        .replace(/\x1b\[m$/, '') + '\x1b[m'
);

// Test the cleaned version
console.log('Cleaned art preview:');
console.log(cleaned.join('\n'));

