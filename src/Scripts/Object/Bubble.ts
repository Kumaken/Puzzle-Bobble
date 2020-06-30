import 'phaser';
import ColorConfig from '../Config/ColorConfig';
import { IBubble } from '../Interfaces/IBubble';
import TextureKeys, { colorToBubbleTexture } from '../Config/TextureKeys';

const ALL_COLORS = [
  ColorConfig.Red,
  ColorConfig.Blue,
  ColorConfig.Green,
  ColorConfig.Yellow,
  ColorConfig.White,
  ColorConfig.Black,
  ColorConfig.Purple
];

export default class Bubble extends Phaser.Physics.Arcade.Sprite
  implements IBubble {
  private _color: number = ColorConfig.Red;
  public _texture: TextureKeys;

  get _x(): number {
    return this.x;
  }
  get _y(): number {
    return this.y;
  }

  get color(): number {
    return this._color;
  }

  get radius(): number {
    return this.width * 0.5;
  }

  // Collider radius is slightly wider than actual bubble radius
  get physicsRadius(): number {
    return this.radius * 0.8;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame = 0
  ) {
    super(scene, x, y, texture, frame);
    this._texture = texture as TextureKeys;
  }

  randomizeColor(): IBubble {
    const r = Phaser.Math.Between(0, ALL_COLORS.length - 1);
    return this.applyColor(ALL_COLORS[r] as number);
  }

  applyColor(color: number): IBubble {
    this._color = color;
    this._texture = colorToBubbleTexture(color);
    return this.setTexture(this._texture);
  }

  giveCircleCollider(): IBubble {
    const radius = this.radius;
    const colliderRadius = this.physicsRadius;
    const diff = radius - colliderRadius; // for collider offset
    return this.setCircle(colliderRadius, diff, diff);
    // return this.setCircle(1000, -1000, -100);
  }

  launchBubble(direction: Phaser.Math.Vector2, speed = 1500): void {
    this.setCollideWorldBounds(true, 1, 1); // collide with world and bounce
    // reposition before launching:
    this.body.x = this.x;
    this.body.y = this.y;
    this.body.enable = true;
    this.setVelocity(direction.x * speed, direction.y * speed);
  }

  stopBubble(): void {
    this.setVelocity(0);
  }

  public moveBubble(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
