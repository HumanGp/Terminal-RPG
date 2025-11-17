/**
 * ENEMY
 */

class Enemy extends Character {
  public type: string;
  public difficulty: "EASY" | "MEDIUM" | "HARD" | "BOSS";
  public abilities: string[];

  constructor(
    name: string,
    type: string,
    difficulty: "EASY" | "MEDIUM" | "HARD" | "BOSS",
    level: number = 1
  ) {
    super(name, level);
    this.type = type;
    this.difficulty = difficulty;

    // Scale stats based on difficulty
    const multiplier = this.getDifficultyMultiplier();
    this.maxHealth = Math.floor(50 * multiplier) + level * 15;
    this.health = this.maxHealth;
    this.attack = Math.floor(8 * multiplier) + level;
    this.defense = Math.floor(5 * multiplier) + level;
    this.speed = Math.floor(6 * multiplier) + level;

    this.abilities = this.generateAbilities();
  }

  private getDifficultyMultiplier(): number {
    switch (this.difficulty) {
      case "EASY":
        return 0.8;
      case "MEDIUM":
        return 1.0;
      case "HARD":
        return 1.3;
      case "BOSS":
        return 2.0;
      default:
        return 1.0;
    }
  }

  private generateAbilities(): string[] {
    const abilityPools = {
      "Syntax Error": ["GLITCH_STRIKE", "CODE_CORRUPTION"],
      "Null Pointer": ["SEGMENT_FAULT", "MEMORY_LEAK"],
      "Infinite Loop": ["TIME_WARP", "STACK_OVERFLOW"],
      "Buffer Overflow": ["DATA_CORRUPTION", "SYSTEM_CRASH"],
      "Glitch King": ["REALITY_SHIFT", "CODE_OBLIVION", "SYSTEM_TAKEOVER"],
    };

    return abilityPools[this.type] || ["BASIC_ATTACK"];
  }

  attackTarget(target: Character): AttackResult {
    const baseDamage = this.attack + Math.floor(Math.random() * 6);
    return { damage: baseDamage, isCritical: false };
  }

  useAbility(ability: string, target: Character): AbilityResult {
    switch (ability) {
      case "GLITCH_STRIKE":
        const damage = Math.floor(this.attack * 1.2);
        return { damage, isCritical: false, manaCost: 0 };

      case "CODE_CORRUPTION":
        target.addStatusEffect({ type: "POISON", duration: 3, value: 5 });
        return { damage: 0, isCritical: false, manaCost: 0 };

      case "MEMORY_LEAK":
        const leakDamage = Math.floor(target.maxHealth * 0.1);
        return { damage: leakDamage, isCritical: false, manaCost: 0 };
    }

    return this.attackTarget(target);
  }

  chooseAction(hero: Character): string {
    // Simple AI for enemy behavior
    if (this.health < this.maxHealth * 0.3 && Math.random() < 0.3) {
      return "DEFEND";
    }

    if (this.abilities.length > 0 && Math.random() < 0.4) {
      const randomAbility =
        this.abilities[Math.floor(Math.random() * this.abilities.length)];
      return randomAbility;
    }

    return "ATTACK";
  }

  levelUp(): void {
    this.level++;
    this.maxHealth += 20;
    this.health = this.maxHealth;
    this.attack += 2;
    this.defense += 1;
    this.speed += 1;
  }
}
