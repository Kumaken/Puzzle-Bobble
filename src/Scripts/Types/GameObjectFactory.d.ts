import { IBubblePool } from '../Interfaces/IBubblePool';
import { IBubble } from '../Interfaces/IBubble';
import { IStaticBubblePool } from '../Interfaces/IStaticBubblePool';

declare module 'phaser' {
  namespace GameObjects {
    export interface GameObjectFactory {
      bubble(x: number, y: number, texture: string, frame?: string): IBubble;

      bubblePool(
        texture: string,
        config?:
          | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
          | Phaser.Types.GameObjects.Group.GroupCreateConfig
      ): IBubblePool;

      staticBubblePool(
        texture: string,
        config?:
          | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
          | Phaser.Types.GameObjects.Group.GroupCreateConfig
      ): IStaticBubblePool;
    }
  }
}
