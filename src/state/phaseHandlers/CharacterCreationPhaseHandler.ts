import { ScreenGenerator } from "../../display/ScreenGenerator";
import { GamePhaseHandler } from "./GamePhaseHandler";

class CharacterCreationPhaseHandler extends GamePhaseHandler {
  protected async onEnter(): Promise<void> {
    await this.ui.add_log("Character creation started...", 30);
  }

  protected async render(): Promise<void> {
    const screenData = ScreenGenerator.generateScreen("CHARACTER_CREATION");
    this.ui.updateScreen(
      screenData.title,
      screenData.content.join("\n"),
      screenData.actions
    );
    await this.ui.add_log(screenData.asciiArt, 0);
  }

  protected async handleInput(): Promise<void> {
    let validInput = false;

    while (!validInput) {
      const userInput = await this.ui.getInput(
        "Choose your character [W/M/R]: "
      );

      if (userInput === "W" || userInput === "M" || userInput === "R") {
        // Create hero based on choice
        const hero = this.createHero(userInput);
        this.gameStore.setHero(hero);

        await this.ui.add_log(
          `You have chosen the path of the ${hero.name}!`,
          30
        );
        await this.delay(1000);
        validInput = true;
      } else {
        await this.ui.add_log("Invalid choice! Please choose W, M, or R.", 30);
      }
    }
  }

  private createHero(choice: string): any {
    // Replace 'any' with your Character_Hero type
    // Your hero creation logic here
    // This should return a proper Character_Hero instance
    return { name: "Hero", level: 1, health: 100 }; // Placeholder
  }

  protected async onExit(): Promise<void> {
    this.gameStore.setPhase("WORLD_MAP");
  }
}

export { CharacterCreationPhaseHandler };
