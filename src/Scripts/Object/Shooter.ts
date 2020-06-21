import * as Phaser from 'phaser';

import { Subject } from 'rxjs';
import TextureKeys from '../Config/TextureKeys';
import { IShooter } from '../Interfaces/IShooter';
import { IBubble } from '../Interfaces/IBubble';
import { IBubblePool } from '../Interfaces/IBubblePool';
import { IShotGuide } from '../Interfaces/IShotGuide';
import ColorConfig from '../Config/ColorConfig';

const DPR = window.devicePixelRatio;
const RADIUS = 100 * DPR;

const HALF_PI = Math.PI * 0.5;
const GAP = 5 * DPR;

export default class Shooter extends Phaser.GameObjects.Container
  implements IShooter {
  private bubble?: IBubble;
  private bubblePool?: IBubblePool;
  private shotGuide?: IShotGuide;

  private shootSubject = new Subject<IBubble>();

  get radius(): number {
    return RADIUS;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y);
    console.log('shooter constructed!');
    const base = scene.add.image(0, 0, TextureKeys.Shooter);

    this.add(base);

    scene.input.addListener(
      Phaser.Input.Events.POINTER_DOWN,
      this.handlePointerDown,
      this
    );
    scene.input.addListener(
      Phaser.Input.Events.POINTER_UP,
      this.handlePointerUp,
      this
    );
  }

  preDestroy() {
    this.scene.input.removeListener(
      Phaser.Input.Events.POINTER_DOWN,
      this.handlePointerDown,
      this
    );
    this.scene.input.removeListener(
      Phaser.Input.Events.POINTER_UP,
      this.handlePointerUp,
      this
    );

    super.preDestroy();
  }

  onShoot() {
    return this.shootSubject.asObservable();
  }

  setBubblePool(pool: IBubblePool) {
    this.bubblePool = pool;
  }

  setGuide(guide: IShotGuide) {
    this.shotGuide = guide;
  }

  attachBubble(bubble?: IBubble) {
    if (!this.bubblePool) {
      return;
    }

    if (!bubble && this.bubble) {
      return;
    }

    if (!bubble) {
      bubble = this.bubblePool.spawn(0, 0);
    }

    this.bubble = bubble;
    this.bubble.disableBody();
    console.log('body disabled');

    const vec = new Phaser.Math.Vector2(0, 0);
    vec.setToPolar(this.rotation + HALF_PI);

    const bubbleRadius = this.bubble.radius;

    this.bubble.x = this.x - vec.x * (RADIUS + bubbleRadius + GAP);
    this.bubble.y = this.y - vec.y * (RADIUS + bubbleRadius + GAP);

    this.bubble.scale = 0;

    this.scene.add.tween({
      targets: this.bubble,
      scale: 1,
      ease: 'Bounce.easeOut',
      duration: 300
    });
    console.log('shooter attach done');
  }

  returnBubble(bubble: IBubble) {
    this.bubblePool?.despawn(bubble);
  }

  update(dt: number) {
    if (!this.bubble) {
      return;
    }

    const pointer = this.scene.input.activePointer;

    if (!pointer.leftButtonDown()) {
      return;
    }

    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;

    const vec = new Phaser.Math.Vector2(dx, dy);
    vec.normalize();

    const rotation = vec.angle();
    this.rotation = rotation + HALF_PI;

    const bubbleRadius = this.bubble.radius;
    const physicsRadius = this.bubble.physicsRadius;

    this.bubble.x = this.x + vec.x * (RADIUS + bubbleRadius + GAP);
    this.bubble.y = this.y + vec.y * (RADIUS + bubbleRadius + GAP);

    this.shotGuide?.showFrom(
      this.bubble.x,
      this.bubble.y,
      vec,
      physicsRadius,
      this.bubble.color
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private handlePointerDown() {}

  private handlePointerUp() {
    if (!this.bubble) {
      return;
    }

    const pointer = this.scene.input.activePointer;
    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;

    const vec = new Phaser.Math.Vector2(dx, dy);
    vec.normalize();

    this.bubble.launch(vec);

    this.shootSubject.next(this.bubble);

    this.bubble = undefined;

    this.shotGuide?.hide();
  }
}

Phaser.GameObjects.GameObjectFactory.register('shooter', function (
  x: number,
  y: number,
  key: string
) {
  return this.displayList.add(new Shooter(this.scene, x, y, key));
});
