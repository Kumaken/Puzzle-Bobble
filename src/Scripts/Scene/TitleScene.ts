import * as Phaser from 'phaser';
import TextureKeys from '../Config/TextureKeys';
import SceneKeys from '../Config/SceneKeys';
import FpsText from '../Object/FpsText';
import '../Object/StaticBubblePool';

export default class TitleScene extends Phaser.Scene {
  private fpsText: FpsText;

  constructor() {
    super({ key: SceneKeys.TitleScreen });
  }

  preload(): void {
    this.load.image('virus', 'src/Assets/Bubbles/Ball_Green.png');
  }

  create(): void {
    this.fpsText = new FpsText(this);
    const staticBallPool = this.add.staticBubblePool(TextureKeys.VirusRed);
    staticBallPool.spawn(100, 100);
  }

  update(): void {
    this.fpsText.update();
  }
}
