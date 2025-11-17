class CombatSystem {
  private hero: Character;
  private enemy: Enemy;
  private ui: Game_UI;
  private inputSystem: InputSystem;
  private turnOrder: Character[] = [];
  private combatLog: string[] = [];

  constructor(hero: Character, enemy: Enemy, ui: Game_UI) {
    this.hero = hero;
    this.enemy = enemy;
    this.ui = ui;
    this.inputSystem = new InputSystem(ui);
    this.determineTurnOrder();
  }

  private determineTurnOrder(): void {
    this.turnOrder = [this.hero, this.enemy].sort((a, b) => b.speed - a.speed);
    this.addCombatLog(`Battle starts! ${this.hero.name} vs ${this.enemy.name}`);
  }

  async executeCombat(): Promise<CombatResult> {
    this.ui.showPhaseWidgets("combat");
    this.updateCombatDisplay();

    let round = 1;

    while (this.hero.health > 0 && this.enemy.health > 0) {
      this.addCombatLog(`--- Round ${round} ---`);

      for (const character of this.turnOrder) {
        if (character.health <= 0) continue;

        if (character === this.hero) {
          await this.executeHeroTurn();
        } else {
          await this.executeEnemyTurn();
        }

        this.updateCombatDisplay();

        // Check if combat ended
        if (this.hero.health <= 0 || this.enemy.health <= 0) {
          break;
        }

        await this.delay(800); // Brief pause between turns
      }

      this.processStatusEffects();
      round++;

      if (round > 20) {
        // Prevent infinite combat
        this.addCombatLog("Combat took too long! Forced retreat.");
        return { winner: "ENEMY", experience: 0, gold: 0 };
      }
    }

    return this.getCombatResult();
  }

  private async executeHeroTurn(): Promise<void> {
    const action = await this.inputSystem.getCombatAction(this.hero);

    switch (action.type) {
      case "ATTACK":
        await this.executeHeroAttack();
        break;

      case "ABILITY":
        await this.executeHeroAbility(action.ability!);
        break;

      case "DEFEND":
        this.hero.isDefending = true;
        this.addCombatLog(
          `{cyan-fg}${this.hero.name} takes a defensive stance!{/cyan-fg}`
        );
        break;

      case "FLEE":
        if (await this.attemptFlee()) {
          throw new CombatFleeException(); // Special case for fleeing
        }
        break;

      case "ITEM":
        await this.useItem(action.item!);
        break;
    }
  }

  private async executeHeroAttack(): Promise<void> {
    const attackResult = this.hero.attackTarget(this.enemy);
    const actualDamage = this.calculateDamage(attackResult.damage, this.enemy);

    this.enemy.takeDamage(actualDamage);

    let message = `{yellow-fg}${this.hero.name}{/yellow-fg} attacks for {red-fg}${actualDamage} damage{/red-fg}`;
    if (attackResult.isCritical) {
      message += ` {bold}{red-fg}(CRITICAL!){/red-fg}{/bold}`;
    }

    this.addCombatLog(message);

    // Special effects for classes
    if (this.hero instanceof Warrior) {
      this.addCombatLog(
        `{cyan-fg}Rage: ${(this.hero as Warrior).rage}/100{/cyan-fg}`
      );
    }
  }

  private async executeHeroAbility(ability: string): Promise<void> {
    const abilityResult = this.hero.useAbility(ability, this.enemy);

    if (abilityResult.damage > 0) {
      const actualDamage = this.calculateDamage(
        abilityResult.damage,
        this.enemy
      );
      this.enemy.takeDamage(actualDamage);

      this.addCombatLog(
        `{yellow-fg}${this.hero.name}{/yellow-fg} uses {magenta-fg}${ability}{/magenta-fg} for {red-fg}${actualDamage} damage{/red-fg}`
      );
    } else {
      this.addCombatLog(
        `{yellow-fg}${this.hero.name}{/yellow-fg} uses {magenta-fg}${ability}{/magenta-fg}`
      );
    }

    // Handle status effects from abilities
    if (abilityResult.statusEffect) {
      this.enemy.addStatusEffect(abilityResult.statusEffect);
      this.addCombatLog(
        `{green-fg}${
          this.enemy.name
        } is now ${abilityResult.statusEffect.type.toLowerCase()}!{/green-fg}`
      );
    }

    // Resource costs
    if (this.hero instanceof Mage && abilityResult.manaCost > 0) {
      (this.hero as Mage).mana -= abilityResult.manaCost;
      this.addCombatLog(
        `{blue-fg}Mana: ${(this.hero as Mage).mana}/100{/blue-fg}`
      );
    }
  }

  private async executeEnemyTurn(): Promise<void> {
    const action = this.enemy.chooseAction(this.hero);

    switch (action) {
      case "ATTACK":
        await this.executeEnemyAttack();
        break;

      case "DEFEND":
        this.enemy.isDefending = true;
        this.addCombatLog(
          `{red-fg}${this.enemy.name} prepares to defend!{/red-fg}`
        );
        break;

      default:
        await this.executeEnemyAbility(action);
        break;
    }
  }

  private async executeEnemyAttack(): Promise<void> {
    const attackResult = this.enemy.attackTarget(this.hero);
    let actualDamage = this.calculateDamage(attackResult.damage, this.hero);

    // Apply defense reduction if hero is defending
    if (this.hero.isDefending) {
      actualDamage = Math.floor(actualDamage * 0.6);
      this.hero.isDefending = false;
      this.addCombatLog(`{cyan-fg}Defense reduced damage!{/cyan-fg}`);
    }

    this.hero.takeDamage(actualDamage);
    this.addCombatLog(
      `{red-fg}${this.enemy.name}{/red-fg} attacks for {red-fg}${actualDamage} damage{/red-fg}`
    );
  }

  private async executeEnemyAbility(ability: string): Promise<void> {
    const abilityResult = this.enemy.useAbility(ability, this.hero);

    if (abilityResult.damage > 0) {
      const actualDamage = this.calculateDamage(
        abilityResult.damage,
        this.hero
      );
      this.hero.takeDamage(actualDamage);

      this.addCombatLog(
        `{red-fg}${this.enemy.name}{/red-fg} uses {magenta-fg}${ability}{/magenta-fg} for {red-fg}${actualDamage} damage{/red-fg}`
      );
    } else {
      this.addCombatLog(
        `{red-fg}${this.enemy.name}{/red-fg} uses {magenta-fg}${ability}{/magenta-fg}`
      );
    }

    if (abilityResult.statusEffect) {
      this.hero.addStatusEffect(abilityResult.statusEffect);
      this.addCombatLog(
        `{red-fg}${
          this.hero.name
        } is now ${abilityResult.statusEffect.type.toLowerCase()}!{/red-fg}`
      );
    }
  }

  private calculateDamage(baseDamage: number, target: Character): number {
    let damage = baseDamage;

    // Apply defense
    damage = Math.max(1, damage - target.defense);

    // Apply status effect modifiers
    const attackBuff = target.statusEffects.find(
      (e) => e.type === "BUFF_ATTACK"
    );
    if (attackBuff) {
      damage += attackBuff.value || 0;
    }

    const defenseBuff = target.statusEffects.find(
      (e) => e.type === "BUFF_DEFENSE"
    );
    if (defenseBuff) {
      damage = Math.max(1, damage - (defenseBuff.value || 0));
    }

    return damage;
  }

  private async attemptFlee(): Promise<boolean> {
    const fleeChance = 0.6; // 60% chance to flee
    if (Math.random() < fleeChance) {
      this.addCombatLog(
        `{green-fg}${this.hero.name} successfully flees from battle!{/green-fg}`
      );
      return true;
    } else {
      this.addCombatLog(`{red-fg}${this.hero.name} failed to escape!{/red-fg}`);
      return false;
    }
  }

  private async useItem(item: string): Promise<void> {
    // Simple item system for now
    switch (item) {
      case "HEALTH_POTION":
        const healAmount = 50;
        this.hero.heal(healAmount);
        this.addCombatLog(
          `{green-fg}${this.hero.name} uses Health Potion and recovers ${healAmount} HP!{/green-fg}`
        );
        break;
      default:
        this.addCombatLog(`Item ${item} not available.`);
    }
  }

  private processStatusEffects(): void {
    [this.hero, this.enemy].forEach((character) => {
      character.statusEffects.forEach((effect) => {
        switch (effect.type) {
          case "POISON":
          case "BURN":
          case "BLEED":
            const dotDamage = effect.value || 5;
            character.takeDamage(dotDamage);
            this.addCombatLog(
              `{red-fg}${
                character.name
              } takes ${dotDamage} damage from ${effect.type.toLowerCase()}!{/red-fg}`
            );
            break;
        }
      });

      character.updateStatusEffects();
    });
  }

  private updateCombatDisplay(): void {
    // Update health gauges
    this.ui.updateCombatHealth(this.hero.health, this.enemy.health);

    // Update any other combat-specific UI elements
    const heroStatus = this.getCharacterStatus(this.hero);
    const enemyStatus = this.getCharacterStatus(this.enemy);

    this.ui.addCombatLog(`Hero: ${this.hero.health}HP ${heroStatus}`);
    this.ui.addCombatLog(`Enemy: ${this.enemy.health}HP ${enemyStatus}`);
  }

  private getCharacterStatus(character: Character): string {
    const statuses = character.statusEffects.map((effect) => effect.type);
    return statuses.length > 0 ? `[${statuses.join(", ")}]` : "";
  }

  private addCombatLog(message: string): void {
    this.combatLog.push(message);
    this.ui.addCombatLog(message);
  }

  private getCombatResult(): CombatResult {
    if (this.hero.health <= 0) {
      this.addCombatLog(
        `{red-fg}${this.hero.name} has been defeated...{/red-fg}`
      );
      return { winner: "ENEMY", experience: 0, gold: 0 };
    } else {
      const experience = this.enemy.calculateExperienceReward();
      const gold = Math.floor(
        this.enemy.level * 8 * (this.enemy.difficulty === "BOSS" ? 10 : 1)
      );

      this.hero.experience += experience;
      this.hero.gold += gold;

      this.addCombatLog(
        `{green-fg}Victory! Gained {yellow-fg}${experience} XP{/yellow-fg} and {yellow-fg}${gold} gold{/yellow-fg}{/green-fg}`
      );

      // Check for level up
      const neededExp = this.hero.level * 100;
      if (this.hero.experience >= neededExp) {
        const oldLevel = this.hero.level;
        this.hero.levelUp();
        this.addCombatLog(
          `{cyan-fg}Level up! ${this.hero.name} advanced from level ${oldLevel} to ${this.hero.level}!{/cyan-fg}`
        );
      }

      return {
        winner: "HERO",
        experience,
        gold,
        levelUp: this.hero.experience >= neededExp,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class CombatFleeException extends Error {
  constructor() {
    super("Player fled from combat");
  }
}
