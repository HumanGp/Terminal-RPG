interface Character {
    name: string;
    attack: number;
    defense: number;
    health: number;
    maxHealth: number;
    take_damage(damage: number): boolean;
    heal(amount: number): void;
}

interface Character_Hero extends Character {
    level: number;
    inventory: string[];
}

interface Character_Enemy extends Character {

}

export type {
    Character,
    Character_Hero,
    Character_Enemy,
}
