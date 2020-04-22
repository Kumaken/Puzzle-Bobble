import * as Phaser from "phaser";

export default class AnimationHelper {
  /**
   * Give pulsating animation to an object
   * @param scene the current game scene
   * @param object object to animate
   * @param duration duration of the animation
   * @param scale the target scale
   * @param repeatTime how many times the animation should play
   * @param delay the delay befor the animation start
   */
  static Pulse(
    scene: Phaser.Scene,
    object: any,
    duration: number,
    scale: number,
    repeatTime: number = 0,
    delay: number = 0
  ) {
    scene.tweens.add({
      targets: object,
      scale: object.scale * scale,
      ease: "Linear",
      duration: duration * 1000,
      yoyo: true,
      repeat: repeatTime,
      delay: delay * 1000,
    });
  }

  /**
   * Resize the object
   * @param scene the current game scene
   * @param object object to animate
   * @param duration duration of the animation
   * @param startScale the starting scale of the object
   * @param targetScale the target scale of the resize
   * @param delay the delay befor the animation start
   */

  static Resize(
    scene: Phaser.Scene,
    object: any,
    duration: number,
    startScale: number,
    targetScale: number,
    delay: number = 0
  ) {

    object.setScale(object.scale * startScale);
    
    scene.tweens.add({
      targets: object,
      scale: object.scale * targetScale,
      ease: "Linear",
      duration: duration * 1000,
      yoyo: false,
      repeat: 0,
      delay: delay * 1000,
    });
  }

  /**
   * Give swinging animation to object
   * @param scene the current game scene
   * @param object object to animate
   * @param duration duration of the animation
   * @param angle the angle of the swing
   * @param repeatTime how many times the animation should play
   */
  static Swing(
    scene: Phaser.Scene,
    object: Phaser.GameObjects.GameObject,
    duration: number,
    angle: number,
    repeatTime: number
  ) {
    scene.tweens.add({
      targets: object,
      angle: angle,
      ease: "Linear",
      duration: (duration / 2) * 1000,
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.Swing(scene, object, duration, -angle, repeatTime);
      },
    });
  }

  /**
   * Give swinging animation to object
   * @param scene the current game scene
   * @param object object to animate
   * @param duration duration of the animation
   * @param alpha the target alpha
   * @param yoyo does the animation reverse on completion?
   * @param delay the delay before animation start
   */
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

  /**
   * Give swinging animation to object
   * @param scene the current game scene
   * @param object object to animate
   * @param duration duration of the animation
   * @param target the target position
   */
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

  /**
   * Give object ease in animation, object grows bigger and then dissipates
   * @param scene the current game scene
   * @param object object to animate
   * @param duration duration of the animation
   */
  static EaseInAndFade(scene: Phaser.Scene, object: any, duration: number) {
    let scale = object.scale;
    
    object.setScale(object.scale * 0.3);
    
    let easeDuration = duration * 0.5;

    if (easeDuration > 0.3) easeDuration = 0.5;

    this.Resize(scene, object, easeDuration, object.scale, scale * 1.3);
    this.ChangeAlpha(scene, object, duration - easeDuration, 0, false, 0.5);
  }
}
