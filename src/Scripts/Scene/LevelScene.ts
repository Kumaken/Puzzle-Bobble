import * as Phaser from 'phaser';
import FpsText from '../Object/FpsText';
import SceneKeys from '../Config/SceneKeys';

export default class LevelScene extends Phaser.Scene {
  private fpsText: FpsText;

  constructor() {
    super({ key: SceneKeys.GameUI });
  }

  create(): void {
    this.fpsText = new FpsText(this);
  }

  update(): void {
    this.fpsText.update();
  }
}
