import 'phaser';
import ColorConfig from '../Config/ColorConfig';
import { IBubble } from '../Interfaces/IBubble';
import { colorToBubbleTexture } from '../Config/TextureKeys';

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
    frame = ''
  ) {
    super(scene, x, y, texture, frame);
  }

  setRandomColor(): IBubble {
    const r = Phaser.Math.Between(0, ALL_COLORS.length - 1);
    return this.setColor(ALL_COLORS[r] as number);
  }

  setColor(color: number): IBubble {
    this._color = color;
    return this.setTexture(colorToBubbleTexture(color));
  }

  useCircleCollider(): IBubble {
    const radius = this.radius;
    const colliderRadius = this.physicsRadius;
    const diff = radius - colliderRadius; // for collider offset
    return this.setCircle(colliderRadius, diff, diff);
    // return this.setCircle(1000, -1000, -100);
  }

  launch(direction: Phaser.Math.Vector2, speed = 2500): void {
    this.setCollideWorldBounds(true, 1, 1); // collide with world and bounce
    // reposition before launching:
    this.body.x = this.x;
    this.body.y = this.y;
    this.body.enable = true;
    this.setVelocity(direction.x * speed, direction.y * speed);
  }

  stop(): void {
    this.setVelocity(0);
  }

  public moveBubble(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}

// this one never got called?
// Phaser.GameObjects.GameObjectFactory.register('bubble', function (
//   x: number,
//   y: number,
//   texture: string,
//   frame = ''
// ) {
//   const bubble = new Bubble(this.scene, x, y, texture, frame);

//   this.displayList.add(bubble);

//   this.updateList.add(bubble);

//   this.scene.physics.world.enableBody(
//     bubble,
//     Phaser.Physics.Arcade.DYNAMIC_BODY
//   );

//   bubble.setCircle(bubble.width * 0.5);

//   return bubble;
// });
