import * as Phaser from 'phaser';
import SceneKeys from '../Config/SceneKeys';
import AlignTool from '../Util/AlignTool';
import FontKeys from '../Config/FontKeys';
import PreloadScene from './PreloadScene';

export default class TitleScene extends Phaser.Scene {
  private clickToStartButton: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKeys.TitleScreen });
  }

  create(): void {
    // clickToStartButton
    this.clickToStartButton = this.add
      .text(0, 0, 'Click To Start Game', {
        fontSize: 30 * PreloadScene.DPR,
        fontFamily: FontKeys.SHPinscherRegular
      })
      .setOrigin(0.5, 0.5)
      .setDepth(1)
      .setInteractive();

    AlignTool.centerBoth(this, this.clickToStartButton);
    this.clickToStartButton.visible = true;

    const clickToStartButtonTween = this.tweens.add({
      targets: this.clickToStartButton,
      duration: 300,
      alpha: 0,
      ease: 'Sine.easeInOut',
      callbackScope: this,
      yoyo: true,
      loop: -1
    });

    this.input.once('pointerup', () => {
      clickToStartButtonTween.remove();
      this.scene.start(SceneKeys.Game);
    });
  }
}
