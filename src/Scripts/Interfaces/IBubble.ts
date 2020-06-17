import BubbleColorConfig from '../Config/BubbleColorConfig';

interface IBubble extends Phaser.Physics.Arcade.Sprite {
  readonly color: BubbleColorConfig;
  readonly radius: number;
  readonly physicsRadius: number;

  setRandomColor(): IBubble;
  setColor(color: BubbleColorConfig): IBubble;
  useCircleCollider(): IBubble;
  launch(direction: Phaser.Math.Vector2): void;
}

export { IBubble };
