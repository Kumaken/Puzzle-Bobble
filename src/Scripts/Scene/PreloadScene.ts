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
    this.load.image(TextureKeys.BubbleRed, 'src/Assets/Bubbles/Ball_Red.png');
    this.load.image(
      TextureKeys.BubbleGreen,
      'src/Assets/Bubbles/Ball_Green.png'
    );
    this.load.image(TextureKeys.BubbleBlue, 'src/Assets/Bubbles/Ball_Blue.png');
    this.load.image(
      TextureKeys.BubbleYellow,
      'src/Assets/Bubbles/Ball_Yellow.png'
    );
    this.load.image(
      TextureKeys.BubblePurple,
      'src/Assets/Bubbles/Ball_Purple.png'
    );
    this.load.image(
      TextureKeys.BubbleWhite,
      'src/Assets/Bubbles/Ball_White.png'
    );
    this.load.image(
      TextureKeys.BubbleBlack,
      'src/Assets/Bubbles/Ball_Black.png'
    );
    this.load.image(TextureKeys.BubblePop, 'src/Assets/Bubbles/Bubble_Pop.png');

    this.load.image(TextureKeys.Shooter, 'src/Assets/Shooters/shooter.png');

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

    this.scene.start(SceneKeys.GameUI);
  }
}
