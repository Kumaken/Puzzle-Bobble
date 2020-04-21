import * as Phaser from "phaser";

export default class AnimationHelper {
  static Pulse(
    scene: Phaser.Scene,
    object: Phaser.GameObjects.GameObject,
    duration: number,
    scale: number,
    repeatTime: number = 0,
    delay: number = 0
  ) {
    scene.tweens.add({
      targets: object,
      scale: scale,
      ease: "Linear",
      duration: duration * 1000,
      yoyo: true,
      repeat: repeatTime,
      delay: delay * 1000,
    });
  }

  static Resize(
    scene: Phaser.Scene,
    object: Phaser.GameObjects.GameObject,
    duration: number,
    scale: number,
    delay: number = 0
  ) {
    scene.tweens.add({
      targets: object,
      scale: scale,
      ease: "Linear",
      duration: duration * 1000,
      yoyo: false,
      repeat: 0,
      delay: delay * 1000,
    });
  }

  static Swing(
    scene: Phaser.Scene,
    object: Phaser.GameObjects.GameObject,
    duration: number,
    degree: number,
    repeatTime: number
  ) {
    scene.tweens.add({
      targets: object,
      angle: degree,
      ease: "Linear",
      duration: (duration / 2) * 1000,
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.Swing(scene, object, duration, -degree, repeatTime);
      },
    });
  }

  static ChangeAlpha(
    scene: Phaser.Scene,
    object: Phaser.GameObjects.GameObject,
    duration: number,
    alpha: number,
    yoyo: boolean = false,
    delay: number = 0
  ) {
    scene.tweens.add({
      delay: delay * 1000,
      targets: object,
      alpha: alpha,
      ease: "Linear",
      duration: duration * 1000,
      yoyo: yoyo,
      repeat: 0,
    });
  }

  static MoveToTarget(
    scene: Phaser.Scene,
    object: Phaser.GameObjects.GameObject,
    duration: number,
    target: Phaser.Geom.Point
  ) {
    scene.tweens.add({
      targets: object,
      x: target.x,
      y: target.y,
      ease: "Linear",
      duration: duration * 1000,
      yoyo: false,
      repeat: 0,
    });
  }

  static EaseInAndFade(scene: Phaser.Scene, object: any, duration: number) {
    let scale = object.scale;
    this.Resize(scene, object, 0, 0.3);

    let easeDuration = duration * 0.5;

    if (easeDuration > 0.3) easeDuration = 0.5;

    this.Resize(scene, object, easeDuration, scale * 1.3);
    this.ChangeAlpha(scene, object, duration - easeDuration, 0, false, 0.5);
  }
}
