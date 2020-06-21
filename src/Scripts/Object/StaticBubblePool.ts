import 'phaser';
import Bubble from './Bubble';
import { IBubble } from '../Interfaces/IBubble';
import { IStaticBubblePool } from '../Interfaces/IStaticBubblePool';

export default class StaticBubblePool extends Phaser.Physics.Arcade.StaticGroup
  implements IStaticBubblePool {
  private texture: string;

  constructor(
    world: Phaser.Physics.Arcade.World,
    scene: Phaser.Scene,
    texture: string,
    config:
      | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
  ) {
    const defaults:
      | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig = {
      classType: Bubble,
      maxSize: -1,
      key: texture,
      frame: 0,
      active: false,
      visible: false,
      frameQuantity: 4
    };

    super(world, scene, Object.assign(defaults, config));

    this.texture = texture;
  }

  spawn(x: number, y: number): IBubble {
    const spawnExisting = this.countActive(false) > 0;

    const bubble: IBubble = this.get(x, y, this.texture);

    if (!bubble) {
      return bubble;
    }

    bubble.useCircleCollider();

    bubble.emit('on-spawned');

    if (spawnExisting) {
      bubble.setVisible(true);
      bubble.setActive(true);
      this.world.add(bubble.body);

      bubble.setRandomColor();
    }

    (bubble.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();

    return bubble;
  }

  despawn(bubble: IBubble): void {
    this.killAndHide(bubble);

    this.world.remove(bubble.body);

    bubble.alpha = 1;
    bubble.body.reset(0, 0);
  }
}

Phaser.GameObjects.GameObjectFactory.register('staticBubblePool', function (
  texture: string,
  config:
    | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
    | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
) {
  const pool = new StaticBubblePool(
    this.scene.physics.world,
    this.scene,
    texture,
    config
  );

  this.updateList.add(pool);

  return pool;
});
