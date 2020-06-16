import * as Phaser from 'phaser';
import FpsText from '../Object/FpsText';
import { TextPopUp, TextConfig } from '../Util/TextPopUp';
import TextureKeys from '../Config/TextureKeys';
import SceneKeys from '../Config/SceneKeys';
import '../Object/StaticBubblePool';
import '../Object/Bubble';

export default class TitleScene extends Phaser.Scene {
  private fpsText: FpsText;

  constructor() {
    super({ key: SceneKeys.TitleScreen });
  }

  preload(): void {}

  create(): void {
    this.fpsText = new FpsText(this);
    // let test: TextConfig = {
    // 	x: 200,
    // 	y: 200,
    // 	text: 'Testttttttt',
    // 	duration: 3
    // };
    // TextPopUp.init(this, 2);
    // TextPopUp.showText(test);

    const staticBubblePool = this.add.staticBubblePool(TextureKeys.Virus);
    staticBubblePool.spawn(0, 0);
  }

  update(): void {
    this.fpsText.update();
  }
}
