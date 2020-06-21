interface IBubble extends Phaser.Physics.Arcade.Sprite {
  readonly color: number;
  readonly radius: number;
  readonly physicsRadius: number;

  setRandomColor(): IBubble;
  setColor(color: number): IBubble;
  useCircleCollider(): IBubble;
  launch(direction: Phaser.Math.Vector2): void;
  stop(): void;
}

export { IBubble };
