export interface Player {
  x: number;
  y: number;
  symbol: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  facing: "left" | "right";
  velocityY: number;
  velocityX: number;
  isJumping: boolean;
  width: number;
  height: number;
  attackCooldown: number;
}

export interface Enemy {
  x: number;
  y: number;
  symbol: string;
  health: number;
  maxHealth: number;
  attack: number;
  type: "patrol" | "shooter" | "charger";
  patrolRange: number;
  direction: number;
  facing: "left" | "right";
  attackCooldown: number;
  patrolStartX: number;
}

export interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  symbol: string;
  damage: number;
  isPlayerProjectile: boolean;
}

export interface Tile {
  symbol: string;
  color: string;
  solid: boolean;
  type: "ground" | "platform" | "spike" | "ladder" | "empty" | "wall";
  damage?: number;
}

export interface WorldLevel {
  width: number;
  height: number;
  tiles: Tile[][];
  enemies: Enemy[];
  items: any[];
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}
