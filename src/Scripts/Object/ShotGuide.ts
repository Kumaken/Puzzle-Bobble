import * as Phaser from 'phaser';
import ColorConfig from '../Config/ColorConfig';
import { IShotGuide } from '../Interfaces/IShotGuide';
import BubbleGrid from './BubbleGrid';
import { IStaticBubblePool } from '../Interfaces/IStaticBubblePool';

const DPR = window.devicePixelRatio;

class GuideCricle extends Phaser.GameObjects.Arc {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 5 * DPR, 0, 360, false, ColorConfig.LightColor, 1);
    this.on('overlapend', function () {
      // this.setVisible(true);
      this.fillColor = 0x196840;
      this.body.debugBodyColor = 0x00ff33;
      console.log('overlapend');
    });
    this.on('overlapstart', function () {
      // this.setVisible(true);
      this.fillColor = 0xdb0b0b;
      this.body.debugBodyColor = 0xff3300;
      console.log('overlapstart');
    });
  }

  giveCircleCollider(radius: number): Phaser.Physics.Arcade.Body {
    const colliderRadius = radius * 0.8;
    const diff = radius - colliderRadius; // for collider offset
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.setCircle(colliderRadius, diff, diff);
  }
}

export default class ShotGuide implements IShotGuide {
  private scene: Phaser.Scene;
  private group: Phaser.GameObjects.Group;
  private guides: GuideCricle[] = [];
  private grid: BubbleGrid;
  private staticBubblePool: IStaticBubblePool;
  private isOverlapping: boolean;
  constructor(
    scene: Phaser.Scene,
    bubbleGrid: BubbleGrid,
    staticBubblePool: IStaticBubblePool
  ) {
    this.scene = scene;
    this.grid = bubbleGrid;
    this.staticBubblePool = staticBubblePool;
    this.group = scene.physics.add.group({
      classType: GuideCricle
    });
    // need to enable physics first before accesing its body
    // this.scene.physics.add.group(this.group);
    this.scene.physics.add.overlap(this.group, this.staticBubblePool);
    this.isOverlapping = false;
  }

  showFrom(
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
    radius: number,
    color: number = ColorConfig.LightColor as number
  ): void {
    const count = 40;

    if (this.guides.length <= 0) {
      for (let i = 0; i < count; ++i) {
        const guide = this.group.get(0, 0) as GuideCricle;

        guide.setActive(true);
        guide.setVisible(true);
        guide.fillColor = color;
        guide.giveCircleCollider(radius);

        this.guides.push(guide);
      }
    }

    const stepInterval = 20 * DPR;
    let vx = direction.x;
    const vy = direction.y;
    const alpha = 1;

    x += vx * radius;
    y += vy * radius;

    for (let i = 0; i < count; ++i) {
      let nx = x + vx * stepInterval;
      const ny = y + vy * stepInterval;
      if (nx <= this.grid.effGridX || nx >= this.grid.effGridRightX) {
        vx *= -1;
        nx = x + vx * stepInterval;
      }

      x = nx;
      y = ny;

      const guide = this.guides[i];

      // TODO: if shot guide tracker touches a bubble, don't show it:
      const body = guide.body as Phaser.Physics.Arcade.Body;
      const touching = !body.touching.none;
      const wasTouching = !body.wasTouching.none;

      if (touching && !wasTouching) guide.emit('overlapstart');
      else if (!touching && wasTouching) guide.emit('overlapend');
      guide.x = x;
      guide.y = y;
      guide.alpha = alpha;

      // alpha *= 0.975;
    }
  }

  hide(): void {
    this.guides.forEach((guide) => this.group.killAndHide(guide));
    this.guides.length = 0;
  }

  // private handleGuideCircleHitBubble(
  //   guideCircle: GuideCricle,
  //   bubble: IBubble
  // ) {
  //   console.log('overlapping');
  //   guideCircle.fillColor = 0xdb0b0b;
  // }
}
