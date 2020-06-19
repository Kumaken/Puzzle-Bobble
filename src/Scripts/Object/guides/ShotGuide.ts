import * as Phaser from 'phaser';
import ColorConfig from '../../Config/ColorConfig';
import { IShotGuide } from '../../Interfaces/IShotGuide';

const DPR = window.devicePixelRatio;

class GuideCricle extends Phaser.GameObjects.Arc {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 5 * DPR, 0, 360, false, ColorConfig.LightColor, 1);
  }
}

export default class ShotGuide implements IShotGuide {
  private scene: Phaser.Scene;
  private group: Phaser.GameObjects.Group;

  private guides: GuideCricle[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.group = scene.add.group({
      classType: GuideCricle
    });
  }

  showFrom(
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
    radius: number,
    color: number = ColorConfig.LightColor as number
  ): void {
    const width = this.scene.scale.width;
    const count = 9;

    if (this.guides.length <= 0) {
      for (let i = 0; i < count; ++i) {
        const guide = this.group.get(0, 0) as GuideCricle;
        guide.setActive(true);
        guide.setVisible(true);
        guide.fillColor = color;
        this.guides.push(guide);
      }
    }

    const stepInterval = 40 * DPR;
    let vx = direction.x;
    const vy = direction.y;
    let alpha = 1;

    x += vx * radius;
    y += vy * radius;

    for (let i = 0; i < count; ++i) {
      let nx = x + vx * stepInterval;
      const ny = y + vy * stepInterval;

      if (nx <= radius) {
        vx *= -1;
        nx = vx * radius;
        nx += vx * radius;
      } else if (nx >= width - radius) {
        vx *= -1;
        nx = width + vx * radius;
        nx += vx * radius;
      }

      x = nx;
      y = ny;

      const guide = this.guides[i];
      guide.x = x;
      guide.y = y;
      guide.alpha = alpha;

      alpha *= 0.8;
    }
  }

  hide() {
    this.guides.forEach((guide) => this.group.killAndHide(guide));
    this.guides.length = 0;
  }
}
