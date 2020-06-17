import 'phaser';
import BubbleColorConfig from '../Config/BubbleColorConfig';
import { IBubble } from '../Interfaces/IBubble';
import TextureKeys from '../Config/TextureKeys';
import TitleScene from '../Scene/TitleScene';

const ALL_COLORS = [
  BubbleColorConfig.Red,
  BubbleColorConfig.Blue,
  BubbleColorConfig.Green,
  BubbleColorConfig.Yellow,
  BubbleColorConfig.White,
  BubbleColorConfig.Black,
  BubbleColorConfig.Purple
];

export default class Bubble extends Phaser.Physics.Arcade.Sprite
  implements IBubble {
  private _color = BubbleColorConfig.Red;

  get color(): BubbleColorConfig {
    return this._color;
  }

  get radius(): number {
    return this.width * 0.5;
  }

  get physicsRadius(): number {
    return this.radius * 0.6;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame = ''
  ) {
    super(scene, x, y, texture, frame);
  }

  setRandomColor(): this {
    const r = Phaser.Math.Between(0, ALL_COLORS.length - 1);
    return this.setColor(ALL_COLORS[r]);
  }

  setColor(color: BubbleColorConfig): this {
    this._color = color;
    this.setTexture(color);

    return this;
  }

  useCircleCollider(): this {
    const radius = this.radius;
    const usedRadius = this.physicsRadius;
    const diff = radius - usedRadius;
    this.setCircle(usedRadius, diff, diff);

    return this;
  }

  launch(direction: Phaser.Math.Vector2, speed = 2500): void {
    this.setCollideWorldBounds(true, 1, 1);

    this.body.x = this.x;
    this.body.y = this.y;

    this.body.enable = true;

    this.setVelocity(direction.x * speed, direction.y * speed);
  }

  public moveBubble(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}

// this one never got called?
Phaser.GameObjects.GameObjectFactory.register('bubble', function (
  x: number,
  y: number,
  texture: string,
  frame = ''
) {
  const bubble = new Bubble(this.scene, x, y, texture, frame);

  this.displayList.add(bubble);

  this.updateList.add(bubble);

  this.scene.physics.world.enableBody(
    bubble,
    Phaser.Physics.Arcade.DYNAMIC_BODY
  );

  bubble.setCircle(bubble.width * 0.5);

  return bubble;
});
