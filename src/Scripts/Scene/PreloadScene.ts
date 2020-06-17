import * as Phaser from 'phaser';
import TextureKeys from '../Config/TextureKeys';
import SceneKeys from '../Config/SceneKeys';
import GameEvents from '../Config/GameEvents';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Preload });
  }

  preload(): void {
    /* all the routes here is referenced from root! */
    this.load.image(TextureKeys.VirusRed, 'src/Assets/Bubbles/Ball_Red.png');
    this.load.image(
      TextureKeys.VirusGreen,
      'src/Assets/Bubbles/Ball_Green.png'
    );
    this.load.image(TextureKeys.VirusBlue, 'src/Assets/Bubbles/Ball_Blue.png');
    this.load.image(
      TextureKeys.VirusYellow,
      'src/Assets/Bubbles/Ball_Yellow.png'
    );
    this.game.events.once(
      GameEvents.PreloadFinished,
      this.handlePreloadFinished,
      this
    );
  }

  create(): void {
    this.game.events.emit(GameEvents.PreloadFinished);
  }

  private handlePreloadFinished() {
    this.scene.stop(SceneKeys.Preload);
    console.log('preload finished');

    this.scene.start(SceneKeys.TitleScreen);
  }
}
