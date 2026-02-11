/*=======================================================*
 |                 CHARACTER CREATION                    |
 *=======================================================*/

import { Mage, Rogue, Warrior } from "../../components/characters/Characters";
import { ScreenGenerator } from "../../display/ScreenGenerator";
import { CHARACTER_CHOICE } from "../../types/game_types";
import { GamePhaseHandler } from "./GamePhaseHandler_base";

export class CharacterCreationPhaseHandler extends GamePhaseHandler {
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

  private createHero(choice: CHARACTER_CHOICE, name: string = ""): any {
    let hero;
    switch (choice) {
      case "W":
        hero = new Warrior(name);
        break;
      case "R":
        hero = new Rogue(name);
        break;
      case "M":
        hero = new Mage(name);
        break;
      default:
        hero = new Warrior(name);
        break;
    }
    return hero;
  }

  protected async onExit(): Promise<void> {
    //update layout and phase
    
    await this.ui.setLayout("world_map");
    this.gameStore.setPhase("WORLD_MAP");
  }
}
