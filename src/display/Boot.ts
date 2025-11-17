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
      await this.phase2_SystemCheck();
      await this.phase3_ModuleLoad();
      await this.phase4_Ready();
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

    await this.ui.scroll_lcd_message(sequences, 80);
    await this.delay(500);
  }

  private async phase2_SystemCheck(): Promise<void> {
    // this.ui.set_lcd_label("SYSTEM CHECK");

    const checks = [
      "MEM TEST....OK",
      "CPU CHECK...OK",
      "GPU INIT....OK",
      "AUDIO DSP..OK",
      "NETWORK....OK",
    ];

    for (const check of checks) {
      await this.ui.type_lcd_message(check, 60);
      await this.delay(300);
    }

    await this.delay(500);
  }

  private async phase3_ModuleLoad(): Promise<void> {
    // this.ui.set_lcd_label("MODULE LOAD");

    // Show loading animation
    await this.ui.show_lcd_loading(3000);

    const modules = [
      "COMBAT SYS...OK",
      "CHARACTER....OK",
      "WORLD GEN...OK",
      "AI ENGINE...OK",
      "AUDIO.......OK",
    ];

    await this.ui.scroll_lcd_message(modules, 70);
    await this.delay(500);
  }

  private async phase4_Ready(): Promise<void> {
    // this.ui.set_lcd_label("READY");

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
