import 'phaser';
import AlignTool from '../Util/AlignTool';
import DepthConfig from '../Config/DepthConfig';
import BubbleColorConfig from '../Config/BubbleColorConfig';
import { Color } from '../Config/ColorConfig';
import { IBubble } from '../Interfaces/IBubble';
import TextureKeys from '../Config/TextureKeys';

const ALL_COLORS = [
  BubbleColorConfig.Red,
  BubbleColorConfig.Blue,
  BubbleColorConfig.Green,
  BubbleColorConfig.Yellow
];

export default class Bubble extends Phaser.Physics.Arcade.Sprite
  implements IBubble {
  private _color = BubbleColorConfig.Red;

  get color() {
    return this._color;
  }

  get radius() {
    return this.width * 0.5;
  }

  get physicsRadius() {
    return this.radius * 0.6;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: string = ''
  ) {
    super(scene, x, y, texture, frame);
    this.setRandomColor();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    AlignTool.scaleToScreenWidth(scene, this, 0.1);
    this.setCircle(85, 0, 0);
    this.setBounce(1);
    this.setDepth(DepthConfig.bubble);
  }

  setRandomColor() {
    const r = Phaser.Math.Between(0, ALL_COLORS.length - 1);
    return this.setColor(ALL_COLORS[r]);
  }

  setColor(color: BubbleColorConfig) {
    this._color = color;
    switch (color) {
      case BubbleColorConfig.Red:
        this.setTexture(TextureKeys.VirusRed);
        break;

      case BubbleColorConfig.Green:
        this.setTexture(TextureKeys.VirusGreen);
        break;

      case BubbleColorConfig.Blue:
        this.setTexture(TextureKeys.VirusBlue);
        break;

      case BubbleColorConfig.Yellow:
        this.setTexture(TextureKeys.VirusYellow);
        break;
    }

    return this;
  }

  useCircleCollider() {
    const radius = this.radius;
    const usedRadius = this.physicsRadius;
    const diff = radius - usedRadius;
    this.setCircle(usedRadius, diff, diff);

    return this;
  }

  launch(direction: Phaser.Math.Vector2, speed = 2500) {
    this.setCollideWorldBounds(true, 1, 1);

    this.body.x = this.x;
    this.body.y = this.y;

    this.body.enable = true;

    this.setVelocity(direction.x * speed, direction.y * speed);
  }

  public moveBubble(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

Phaser.GameObjects.GameObjectFactory.register('bubble', function (
  x: number,
  y: number,
  texture: string,
  frame: string = ''
) {
  // @ts-ignore
  var ball = new Ball(this.scene, x, y, texture, frame);

  // @ts-ignore
  this.displayList.add(ball);
  // @ts-ignore
  this.updateList.add(ball);
  // @ts-ignore
  this.scene.physics.world.enableBody(ball, Phaser.Physics.Arcade.DYNAMIC_BODY);

  ball.setCircle(ball.width * 0.5);

  return ball;
});
