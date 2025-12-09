/*=======================================================*
 |                   Player Object                       |
 *=======================================================*/

export class Player {
  public static instance: Player | null = null;
  public x: number;
  public y: number;
  public symbol: string;
  public health: number;
  public maxHealth: number;
  public attack: number;
  public defense: number;
  public facing: "left" | "right";
  public velocityY: number;
  public velocityX: number;
  public isJumping: boolean;
  public width: number;
  public height: number;
  public attackCooldown: number;
  
  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.symbol = "⚔️";
    this.health = 100;
    this.maxHealth = 100;
    this.attack = 10;
    this.defense = 5;
    this.facing = "right";
    this.velocityY = 0;
    this.velocityX = 0;
    this.isJumping = false;
    this.width = 1;
    this.height = 2;
    this.attackCooldown = 0;
  }

  public static getInstance({x , y}: {x: number, y: number}) {
    if (!Player.instance) {
      if (!x || !y) {
        throw new Error("x and y coordinates should be provided");
      }
      Player.instance = new Player(x, y);
    }
    return Player.instance;
  }
}
