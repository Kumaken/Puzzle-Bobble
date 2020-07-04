import * as Phaser from 'phaser';
import ColorConfig from '../Config/ColorConfig';
import { IShotGuide } from '../Interfaces/IShotGuide';
import BubbleGrid from './BubbleGrid';
import { IStaticBubblePool } from '../Interfaces/IStaticBubblePool';

const DPR = window.devicePixelRatio;

class GuideCricle extends Phaser.GameObjects.Arc {
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 5 * DPR, 0, 360, false, ColorConfig.LightColor, 1);
    this.on('overlapend', function () {
      this.setVisible(true);
    });
    this.on('overlapstart', function () {
      this.setVisible(false);
    });
  }

  giveCircleCollider(radius: number): Phaser.Physics.Arcade.Body {
    const colliderRadius = radius * 0.8;
    const diff = radius - colliderRadius; // for collider offset
    return this.body.setCircle(colliderRadius, diff, diff);
  }
}

export default class ShotGuide implements IShotGuide {
  private scene: Phaser.Scene;
  private group: Phaser.GameObjects.Group;
  private guides: GuideCricle[] = [];
  private grid: BubbleGrid;
  private staticBubblePool: IStaticBubblePool;
  private circleCount: number;

  constructor(
    scene: Phaser.Scene,
    bubbleGrid: BubbleGrid,
    staticBubblePool: IStaticBubblePool,
    circleCount: number
  ) {
    this.scene = scene;
    this.grid = bubbleGrid;
    this.staticBubblePool = staticBubblePool;
    // need to enable physics first before accesing its body
    this.group = scene.physics.add.group({
      classType: GuideCricle
    });
    this.circleCount = circleCount;
    // add overlap event:
    this.scene.physics.add.overlap(this.group, this.staticBubblePool);
  }

  showFrom(
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
    radius: number,
    color: number = ColorConfig.LightColor as number
  ): void {
    if (this.guides.length <= 0) {
      for (let i = 0; i < this.circleCount; ++i) {
        const guide = this.group.get(0, 0) as GuideCricle;

        guide.giveCircleCollider(radius);
        guide.setActive(true);
        guide.setVisible(true);
        guide.fillColor = color;

        this.guides.push(guide);
      }
    }

    const stepInterval = 20 * DPR;
    let vx = direction.x;
    const vy = direction.y;
    let alpha = 1;

    x += vx * radius;
    y += vy * radius;

    for (let i = 0; i < this.circleCount; ++i) {
      const guide = this.guides[i];
      let nx = x + vx * stepInterval;
      const ny = y + vy * stepInterval;
      if (nx <= this.grid.effGridX || nx >= this.grid.effGridRightX) {
        vx *= -1;
        nx = x + vx * stepInterval;
      }

      x = nx;
      y = ny;
      guide.x = x;
      guide.y = y;
      guide.alpha = alpha;

      alpha *= 0.99;

      // DONE: if shot guide tracker touches a bubble, don't show it;
      if (guide.body.embedded) guide.body.touching.none = false;
      const touching = !guide.body.touching.none;
      const wasTouching = !guide.body.wasTouching.none;
      if (touching && !wasTouching) {
        guide.emit('overlapstart');
      } else if (!touching && wasTouching) {
        guide.emit('overlapend');
      }
    }
  }

  hide(): void {
    this.guides.forEach((guide) => this.group.killAndHide(guide));
    this.guides.length = 0;
  }

  public analyzeGuideCircles(): void {
    for (let i = 0; i < this.circleCount; ++i) {
      const guide = this.guides[i];
      if (guide.body.embedded) guide.body.touching.none = false;
      const touching = !guide.body.touching.none;
      const wasTouching = !guide.body.wasTouching.none;
      console.log('touch', touching, 'wasTouch', wasTouching);
    }
  }
  // private handleGuideCircleHitBubble(
  //   guideCircle: GuideCricle,
  //   bubble: IBubble
  // ) {
  //   console.log('overlapping');
  //   guideCircle.fillColor = 0xdb0b0b;
  // }
}
