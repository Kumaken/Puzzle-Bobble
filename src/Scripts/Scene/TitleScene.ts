import * as Phaser from 'phaser';
import TextureKeys from '../Config/TextureKeys';
import SceneKeys from '../Config/SceneKeys';
import FpsText from '../Object/FpsText';

export default class TitleScene extends Phaser.Scene {
  private fpsText: FpsText;

  constructor() {
    super({ key: SceneKeys.TitleScreen });
  }

  preload(): void {}

  create(): void {
    this.fpsText = new FpsText(this);
  }

  update(): void {
    this.fpsText.update();
  }
}
