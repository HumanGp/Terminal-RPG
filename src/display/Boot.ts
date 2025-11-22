import { Game_UI } from "./GameUI";


class LCDBootHandler {
  private ui: Game_UI;

  constructor(ui: Game_UI) {
    this.ui = ui;
  }

  async executeBootSequence(): Promise<void> {
    // Hide standard UI elements during boot
    this.hideStandardUI();

    try {
      await this.phase1_PowerOn();
      await this.phase2_Ready();
    } finally {
      // Always show standard UI after boot
      this.showStandardUI();
    }
  }

  private async phase1_PowerOn(): Promise<void> {
    // this.ui.set_lcd_label("POWER ON ");

    const sequences = [
      "POWERED BY HUMANGPT"
    ];

    await this.ui.scroll_lcd_message(sequences, 250);
    await this.delay(500);
  }



  private async phase2_Ready(): Promise<void> {
    // this.ui.set_lcd_label("READY");
    await this.ui.show_lcd_loading(3000);

    const readyMessages = [
      "SYSTEM READY!",
      "TERMINAL RPG",
      "INSERT COIN...",
      "PRESS START...",
    ];

    // Flash between messages
    for (let i = 0; i < 6; i++) {
      const message = readyMessages[i % readyMessages.length];
      this.ui.set_lcd_display(
        message!.padEnd(16, " "),
        i % 2 === 0 ? "green" : "cyan"
      );
      await this.delay(500);
    }

    // Final display
    this.ui.set_lcd_display("READY!".padEnd(16, " "), "green");
    await this.delay(1000);
  }

  private hideStandardUI(): void {
    // You'll need to add hide/show methods to your Game_UI
    // this.ui.hideGameArea();
    // this.ui.hideLogArea();
  }

  private showStandardUI(): void {
    // this.ui.showGameArea();
    // this.ui.showLogArea();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export { LCDBootHandler };
