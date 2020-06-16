import 'phaser';
import Bubble from './Bubble';
import { IBubblePool } from '../Interfaces/IBubblePool';
import { IBubble } from '../Interfaces/IBubble';

export default class BubblePool extends Phaser.Physics.Arcade.Group
  implements IBubblePool {
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

  spawn(x: number, y: number) {
    const spawnExisting = this.countActive(false) > 0;

    const bubble: IBubble = this.get(x, y, this.texture);

    if (!bubble) {
      return bubble;
    }

    if (spawnExisting) {
      bubble.setVisible(true);
      bubble.setActive(true);
      this.world.add(bubble.body);
    }

    return bubble;
  }

  despawn(bubble: IBubble) {
    this.killAndHide(bubble);

    this.world.remove(bubble.body);

    bubble.body.reset(0, 0);
  }
}

Phaser.GameObjects.GameObjectFactory.register('bubblePool', function (
  texture: string,
  config:
    | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
    | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
) {
  // @ts-ignore
  const pool = new BubblePool(
    this.scene.physics.world,
    this.scene,
    texture,
    config
  );

  // @ts-ignore
  this.updateList.add(pool);

  return pool;
});
