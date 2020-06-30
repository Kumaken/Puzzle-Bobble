import * as Phaser from 'phaser';
import Bubble from './Bubble';
import { IBubblePool } from '../Interfaces/IBubblePool';
import { IBubble } from '../Interfaces/IBubble';

/**
 * Bubble pool class: Object Pool for bubble loaded into the shooter (dynamic)
 */
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
      frameQuantity: 4 // load 4 bubbles into the shooter at construction
    };
    super(world, scene, Object.assign(defaults, config));
    this.texture = texture;
  }

  spawn(x: number, y: number): IBubble {
    const spawnExisting = this.countActive(false) > 0; // count inactive bubbles in pool
    const bubble: IBubble = this.get(x, y, this.texture);

    if (!bubble) {
      return bubble;
    }

    bubble.giveCircleCollider();
    bubble.emit('on-spawned');

    if (spawnExisting) {
      bubble.setVisible(true);
      bubble.setActive(true);
      this.world.add(bubble.body);
    }

    bubble.randomizeColor();
    bubble.anims.play(bubble._texture + '_idle', true);
    return bubble;
  }

  despawn(bubble: IBubble): void {
    this.killAndHide(bubble);
    this.world.remove(bubble.body);
    bubble.body.reset(0, 0);
    bubble.anims.stop();
  }
}

// Register to gameobject factory (Module Augmentation)
Phaser.GameObjects.GameObjectFactory.register('bubblePool', function (
  texture: string,
  config:
    | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
    | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
) {
  const pool = new BubblePool(
    this.scene.physics.world,
    this.scene,
    texture,
    config
  );

  this.updateList.add(pool);

  return pool;
});
