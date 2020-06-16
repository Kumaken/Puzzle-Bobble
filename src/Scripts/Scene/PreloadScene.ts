import * as Phaser from 'phaser';
import TextureKeys from '../Config/TextureKeys';
import SceneKeys from '../Config/SceneKeys';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Preload });
  }

  preload(): void {
    /* all the routes here is referenced from root! */
    this.load.image(TextureKeys.Virus, 'src/Assets/Bubbles/Ball_Green.png');
  }

  create(): void {
    this.scene.start(SceneKeys.TitleScreen);
  }
}
