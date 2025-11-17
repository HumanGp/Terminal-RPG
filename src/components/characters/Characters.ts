/*=======================================================*
 |               PLAYER CHARACTERS                       |
 *=======================================================*/

abstract class Character {
  public name: string;
  public level: number;
  public health!: number;
  public maxHealth!: number;
  public attack!: number;
  public defense!: number;
  public speed!: number;
  public gold: number;
  public experience: number;

  // Status effects
  public statusEffects: StatusEffect[] = [];
  public isDefending: boolean = false;

  constructor(name: string, level: number = 1) {
    this.name = name;
    this.level = level;
    this.gold = 0;
    this.experience = 0;
  }

  abstract attackTarget(target: Character): AttackResult;
  abstract useAbility(ability: string, target: Character): AbilityResult;
  abstract levelUp(): void;

  takeDamage(damage: number): void {
    const actualDamage = Math.max(1, damage - this.defense);
    this.health = Math.max(0, this.health - actualDamage);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addStatusEffect(effect: StatusEffect): void {
    this.statusEffects.push(effect);
  }

  updateStatusEffects(): void {
    this.statusEffects = this.statusEffects.filter((effect) => {
      effect.duration--;
      return effect.duration > 0;
    });
  }

  calculateExperienceReward(): number {
    return this.level * 10;
  }
}

interface StatusEffect {
  type: "POISON" | "BURN" | "STUN" | "BLEED" | "BUFF_ATTACK" | "BUFF_DEFENSE";
  duration: number;
  value?: number;
}

interface AttackResult {
  damage: number;
  isCritical: boolean;
  statusEffect?: StatusEffect;
}

interface AbilityResult extends AttackResult {
  manaCost: number;
  cooldown?: number;
}


class Warrior extends Character {
  public rage: number = 0;
  public maxRage: number = 100;
  public class: string = "Warrior";

  constructor(name: string) {
    super(name);
    this.name = 'Warrior'
    this.maxHealth = 120 + this.level * 20;
    this.health = this.maxHealth;
    this.attack = 15 + this.level;
    this.defense = 12 + this.level;
    this.speed = 8;
  }

  attackTarget(target: Character): AttackResult {
    const baseDamage = this.attack + Math.floor(Math.random() * 6);
    const isCritical = Math.random() < 0.1; // 10% crit chance

    let damage = isCritical ? baseDamage * 2 : baseDamage;

    // Rage generation
    this.rage = Math.min(this.maxRage, this.rage + 10);

    return { damage, isCritical };
  }

  useAbility(ability: string, target: Character): AbilityResult {
    switch (ability) {
      case "SHIELD_BASH":
        if (this.rage >= 25) {
          this.rage -= 25;
          const damage = Math.floor(this.attack * 0.8);
          target.addStatusEffect({ type: "STUN", duration: 1 });
          return { damage, isCritical: false, manaCost: 0 };
        }
        break;

      case "WHIRLWIND":
        if (this.rage >= 40) {
          this.rage -= 40;
          const damage = Math.floor(this.attack * 1.2);
          // Hits all enemies in combat
          return { damage, isCritical: false, manaCost: 0 };
        }
        break;

      case "BERSERKER_RAGE":
        this.rage = this.maxRage;
        this.addStatusEffect({ type: "BUFF_ATTACK", duration: 3, value: 5 });
        return { damage: 0, isCritical: false, manaCost: 0 };
    }

    return { damage: 0, isCritical: false, manaCost: 0 };
  }

  levelUp(): void {
    this.level++;
    this.maxHealth += 25;
    this.health = this.maxHealth;
    this.attack += 3;
    this.defense += 2;
    this.speed += 1;
  }
}

class Mage extends Character {
  public mana: number = 100;
  public maxMana: number = 100;
  public class: string = "Mage";

  constructor(name: string) {
    super(name);
    this.name = 'Mage'
    this.maxHealth = 80 + this.level * 15;
    this.health = this.maxHealth;
    this.attack = 12 + this.level;
    this.defense = 8 + this.level;
    this.speed = 10;
  }

  attackTarget(target: Character): AttackResult {
    const baseDamage = this.attack + Math.floor(Math.random() * 4);
    const isCritical = Math.random() < 0.15; // 15% crit chance

    return { damage: isCritical ? baseDamage * 2 : baseDamage, isCritical };
  }

  useAbility(ability: string, target: Character): AbilityResult {
    switch (ability) {
      case "FIREBALL":
        if (this.mana >= 30) {
          this.mana -= 30;
          const damage = Math.floor(this.attack * 1.8);
          target.addStatusEffect({ type: "BURN", duration: 3, value: 5 });
          return { damage, isCritical: false, manaCost: 30 };
        }
        break;

      case "ICE_SHARD":
        if (this.mana >= 20) {
          this.mana -= 20;
          const damage = Math.floor(this.attack * 1.3);
          target.addStatusEffect({ type: "STUN", duration: 1 });
          return { damage, isCritical: false, manaCost: 20 };
        }
        break;

      case "HEAL":
        if (this.mana >= 25) {
          this.mana -= 25;
          const healAmount = 30 + this.level * 5;
          this.heal(healAmount);
          return { damage: 0, isCritical: false, manaCost: 25 };
        }
        break;
    }

    return { damage: 0, isCritical: false, manaCost: 0 };
  }

  levelUp(): void {
    this.level++;
    this.maxHealth += 15;
    this.maxMana += 20;
    this.health = this.maxHealth;
    this.mana = this.maxMana;
    this.attack += 4;
    this.defense += 1;
    this.speed += 2;
  }
}

class Rogue extends Character {
  public energy: number = 100;
  public maxEnergy: number = 100;
  public class: string = "Rogue";
  private criticalChance: number = 0.2;

  constructor(name: string) {
    super(name);
    this.name = 'Rouge'
    this.maxHealth = 90 + this.level * 18;
    this.health = this.maxHealth;
    this.attack = 14 + this.level;
    this.defense = 9 + this.level;
    this.speed = 12;
  }

  attackTarget(target: Character): AttackResult {
    const baseDamage = this.attack + Math.floor(Math.random() * 8);
    const isCritical = Math.random() < this.criticalChance;

    let damage = isCritical ? baseDamage * 2.5 : baseDamage;

    // Energy regeneration
    this.energy = Math.min(this.maxEnergy, this.energy + 15);

    return { damage, isCritical };
  }

  useAbility(ability: string, target: Character): AbilityResult {
    switch (ability) {
      case "BACKSTAB":
        if (this.energy >= 35) {
          this.energy -= 35;
          const damage = Math.floor(this.attack * 2.5);
          return { damage, isCritical: true, manaCost: 0 };
        }
        break;

      case "POISON_DART":
        if (this.energy >= 25) {
          this.energy -= 25;
          const damage = Math.floor(this.attack * 0.8);
          target.addStatusEffect({ type: "POISON", duration: 4, value: 8 });
          return { damage, isCritical: false, manaCost: 0 };
        }
        break;

      case "SHADOW_STEP":
        if (this.energy >= 40) {
          this.energy -= 40;
          this.addStatusEffect({ type: "BUFF_ATTACK", duration: 2, value: 10 });
          return { damage: 0, isCritical: false, manaCost: 0 };
        }
        break;
    }

    return { damage: 0, isCritical: false, manaCost: 0 };
  }

  levelUp(): void {
    this.level++;
    this.maxHealth += 18;
    this.health = this.maxHealth;
    this.attack += 5;
    this.defense += 1;
    this.speed += 3;
    this.criticalChance += 0.02;
  }
}

export {
  Warrior,
  Mage,
  Rogue,
}
