import 'phaser';

import { Subject, Observable } from 'rxjs';
import { IShooter } from '../Interfaces/IShooter';
import { IBubble } from '../Interfaces/IBubble';
import { IBubblePool } from '../Interfaces/IBubblePool';
import { IShotGuide } from '../Interfaces/IShotGuide';
import PreloadScene from '../Scene/PreloadScene';

const HALF_PI = Math.PI * 0.5;

export default class Shooter extends Phaser.GameObjects.Container
  implements IShooter {
  private bubble?: IBubble;
  private bubblePool?: IBubblePool;
  public shotGuide?: IShotGuide;
  private _height: number;
  private shootSubject = new Subject<IBubble>();
  private nextBubble: IBubble;
  public static isShooting: boolean;

  get shooterHeight(): number {
    return this._height;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y);
    const base = scene.add.image(0, 0, texture);
    this._height = base.height;
    this.add(base);
    Shooter.isShooting = false;

    scene.input.addListener(
      Phaser.Input.Events.POINTER_UP,
      this.handlePointerUp,
      this
    );
  }

  preDestroy(): void {
    this.scene.input.removeListener(
      Phaser.Input.Events.POINTER_UP,
      this.handlePointerUp,
      this
    );

    super.preDestroy();
  }

  onShoot(): Observable<IBubble> {
    return this.shootSubject.asObservable();
  }

  setBubblePool(pool: IBubblePool): void {
    this.bubblePool = pool;
  }

  setShooterGuide(guide: IShotGuide): void {
    this.shotGuide = guide;
  }

  prepareNextBubble(bubble?: IBubble): void {
    if (!this.bubblePool) {
      return;
    }

    if (!bubble) {
      bubble = this.bubblePool.spawn(0, 0);
    }

    bubble.setScale(0);
    bubble.disableBody();
    bubble.x = this.x + 220;
    bubble.y = this.y + 95;

    this.nextBubble = bubble;

    this.scene.add.tween({
      targets: this.nextBubble,
      scaleX: PreloadScene.screenScale.scaleWidth,
      scaleY: PreloadScene.screenScale.scaleHeight,
      ease: 'Bounce.easeOut',
      duration: 500
    });
  }

  attachNextBubble(): void {
    if (!this.nextBubble) return;
    this.bubble = this.nextBubble;
    this.bubble.disableBody();

    const vec = new Phaser.Math.Vector2(0, 0);
    vec.setToPolar(this.rotation + HALF_PI);

    const bubbleRadius = this.bubble.radius;

    this.bubble.x = this.x - vec.x * bubbleRadius;
    this.bubble.y = this.y - vec.y * bubbleRadius;

    this.bubble.scale = 0;

    this.scene.add.tween({
      targets: this.bubble,
      scaleX: PreloadScene.screenScale.scaleWidth,
      scaleY: PreloadScene.screenScale.scaleHeight,
      ease: 'Bounce.easeOut',
      duration: 500
    });
  }

  recycleBubble(bubble: IBubble): void {
    this.bubblePool?.despawn(bubble);
  }

  update(): void {
    // blocks shooter when isShooting is true
    if (!this.bubble) {
      return;
    }

    const pointer = this.scene.input.activePointer;

    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;

    const vec = new Phaser.Math.Vector2(dx, dy);
    vec.normalize();

    const rotation = vec.angle();
    this.rotation = rotation + HALF_PI;

    const bubbleRadius = this.bubble.radius;
    const physicsRadius = this.bubble.physicsRadius;

    this.bubble.x = this.x + vec.x * bubbleRadius;
    this.bubble.y = this.y + vec.y * bubbleRadius;

    const guideRadius =
      this.bubble.radius * PreloadScene.screenScale.scaleWidth;
    this.shotGuide?.showFrom(
      this.bubble.x,
      this.bubble.y,
      vec,
      guideRadius - physicsRadius / 2, // grid right x
      this.bubble.color
    );
  }

  private handlePointerUp() {
    if (!this.bubble || Shooter.isShooting) {
      return;
    }
    Shooter.isShooting = true;
    const pointer = this.scene.input.activePointer;
    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;
    const vec = new Phaser.Math.Vector2(dx, dy);
    vec.normalize();
    this.bubble.launchBubble(vec);
    this.shootSubject.next(this.bubble);
    this.bubble = undefined;
    this.shotGuide?.hide();
  }
}

// Register to gameobject factory (Module Augmentation)
Phaser.GameObjects.GameObjectFactory.register('shooter', function (
  x: number,
  y: number,
  key: string
) {
  return this.displayList.add(new Shooter(this.scene, x, y, key));
});
