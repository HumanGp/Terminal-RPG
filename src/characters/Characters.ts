/**
 * PLAYER CHARACTERS
 */

import { Hero } from "./Hero";

type Ability = {
    name: string;
    cost: number;
    type?: string;
    effect?: string;
    damage?: number;
    critBonus?: boolean;
}

// The tank
class Warrior extends Hero { 
    private rage: number = 0;
    private abilities: Ability[]

    constructor(name: string) {
        super(name);
        this.health = 120;
        this.maxHealth = 120;
        this.attack = 18;
        this.defense = 8;
        this.abilities = [
            {
                name: "Slash",
                cost: 0,
                type: "basic"
            },
            {
                name: "Shield Bash",
                cost: 30,
                type: "rage",
                effect: "stun"
            },
            {
                name: "Whirlwind",
                cost: 50,
                type: "rage",
                effect: "aoe"
            }
        ];
    }

    // Gains rage when taking damage
    take_damage(damage: number): void {
        this.rage += damage;
        super.take_damage(damage)
    }
};

// The Spellcaster
class Mage extends Hero {
    private mana: number = 100;
    private maxMana: number = 100;
    private abilities: Ability[];


    constructor(name: string) {
        super(name);
        this.health = 80;
        this.maxHealth = 80;
        this.attack = 12;
        this.defense = 3;
        this.abilities = [
            {
                name: "Firebolt",
                cost: 10,
                damage: 15,
            },
            {
                name: "Ice Shield",
                cost: 10,
                effect: "defense_up"
            },
            {
                name: "Chain Lightning",
                cost: 40,
                damage: 25,
                effect: "aoe"
            }
        ]
    }

    //Regenerate mana each turn
    regenerate_mana() {
        this.mana = Math.min(this.maxMana, this.mana + 5);
    }
};
 
// The Damage Dealer
class Rouge extends Hero {
    private energy: number = 100;
    private criticalChance: number = 0.2; // 20% crit
    private abilities: Ability[];

    constructor(name: string) {
        super(name);
        this.health = 90;
        this.maxHealth = 90;
        this.defense = 4;
        this.abilities = [
            {
                name: "Backstab",
                cost: 30,
                damage: 25,
                critBonus: true
            },
            {
                name: "Poison Dart",
                cost: 20,
                effect: "poison"
            },
            {
                name: "Shadow Dodge",
                cost: 40,
                effect: "evade"
            }
        ]
    }

    //High critical chance
    calculate_damage() {
        const isCritical = Math.random() < this.criticalChance;
        return isCritical ? this.attack * 2 : this.attack;
    }
};

export { Warrior, Rouge, Mage };
