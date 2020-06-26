import { IBubble } from './IBubble';
import ColorConfig from '../Config/ColorConfig';

interface IStaticBubblePool extends Phaser.Physics.Arcade.StaticGroup {
  spawn(x: number, y: number, color: ColorConfig): IBubble;
  despawn(bubble: IBubble);
}

export { IStaticBubblePool };
