import 'phaser';

export default class ShooterPlatform extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame = ''
  ) {
    super(scene, x, y, texture, frame);
  }
}
