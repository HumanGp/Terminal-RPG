import { Game_UI } from "../../display/GameUI";
import { Character, Character_Hero } from "../../types/characters_types";

class InputSystem {
  private ui: Game_UI;

  constructor(ui: Game_UI) {
    this.ui = ui;
  }

  async getCombatAction(hero: Character_Hero): Promise<PlayerAction> {
    const actionMap = this.getActionMap(hero);
    const validInputs = Object.keys(actionMap);

    while (true) {
      this.ui.update_actions(this.getCombatActionsDisplay(hero));
      const input = await this.ui.getInput("Choose action: ");

      if (validInputs.includes(input)) {
        return actionMap[input];
      }

      await this.ui.add_log("Invalid action! Try again.", 30);
    }
  }

  private getActionMap(hero: Character_Hero): { [key: string]: PlayerAction } {
    const baseMap: { [key: string]: PlayerAction } = {
      A: { type: "ATTACK" },
      D: { type: "DEFEND" },
      H: { type: "ITEM", item: "HEALTH_POTION" },
      R: { type: "FLEE" },
    };

    // class-specific abilities
    if (hero.class === "Warrior") {
      baseMap["S"] = { type: "ABILITY", ability: "SHIELD_BASH" };
      baseMap["W"] = { type: "ABILITY", ability: "WHIRLWIND" };
      baseMap["B"] = { type: "ABILITY", ability: "BERSERKER_RAGE" };
    } else if (hero.class === "Mage") {
      baseMap["F"] = { type: "ABILITY", ability: "FIREBALL" };
      baseMap["I"] = { type: "ABILITY", ability: "ICE_SHARD" };
      baseMap["H"] = { type: "ABILITY", ability: "HEAL" }; // Override health potion
    } else if (hero.class === "Rogue") {
      baseMap["B"] = { type: "ABILITY", ability: "BACKSTAB" };
      baseMap["P"] = { type: "ABILITY", ability: "POISON_DART" };
      baseMap["T"] = { type: "ABILITY", ability: "SHADOW_STEP" };
    }

    return baseMap;
  }

  private getCombatActionsDisplay(hero: Character_Hero): string[] {
    const baseActions = ["[A] Attack", "[D] Defend", "[R] Run"];

    if (hero.class === "Warrior") {
      baseActions.push(
        "[S] Shield Bash",
        "[W] Whirlwind",
        "[B] Berserker Rage"
      );
    } else if (hero.class === "Mage") {
      baseActions.push("[F] Fireball", "[I] Ice Shard", "[H] Heal");
    } else if (hero.class === "Rogue") {
      baseActions.push("[B] Backstab", "[P] Poison Dart", "[T] Shadow Step");
    }

    return baseActions;
  }
}
