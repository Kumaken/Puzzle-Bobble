import TextureKeys from '../Config/TextureKeys';

interface IBubble extends Phaser.Physics.Arcade.Sprite {
  readonly _x: number;
  readonly _y: number;
  readonly color: number;
  readonly radius: number;
  readonly physicsRadius: number;
  readonly _texture: TextureKeys;

  randomizeColor(): IBubble;
  applyColor(color: number): IBubble;
  giveCircleCollider(): IBubble;
  launchBubble(direction: Phaser.Math.Vector2): void;
  stopBubble(): void;
}

export { IBubble };
