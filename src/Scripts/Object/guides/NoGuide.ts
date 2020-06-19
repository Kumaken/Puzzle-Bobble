import { IShotGuide } from '../../Interfaces/IShotGuide';

export default class NoGuide implements IShotGuide {
  private static sharedInstance = new NoGuide();

  static instance() {
    return this.sharedInstance;
  }

  showFrom(
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
    radius: number
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hide() {}
}
