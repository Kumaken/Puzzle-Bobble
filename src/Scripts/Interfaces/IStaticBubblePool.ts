import { IBubble } from './IBubble';

interface IStaticBubblePool extends Phaser.Physics.Arcade.StaticGroup {
  spawn(x: number, y: number): IBubble;
  despawn(bubble: IBubble);
}

export { IStaticBubblePool };
