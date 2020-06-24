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

    this.load.image(TextureKeys.Shooter, 'src/Assets/Shooters/0.png');
    this.load.image(
      TextureKeys.ShooterFoundation,
      'src/Assets/ShooterFoundation/0.png'
    );
    this.load.image(
      TextureKeys.PlatformSign,
      'src/Assets/ShooterDecor/sign.png'
    );
    this.load.image(
      TextureKeys.BubblePlatform,
      'src/Assets/ShooterDecor/platform.png'
    );

    // Game Borders
    this.load.image(TextureKeys.TopBorder, 'src/Assets/Borders/top1.png');
    this.load.image(TextureKeys.LeftBorder, 'src/Assets/Borders/left1.png');
    this.load.image(TextureKeys.RightBorder, 'src/Assets/Borders/right1.png');
    // this.load.image(
    //   TextureKeys.BottomBorder,
    //   'src/Assets/Borders/platform.png'
    // );
    this.load.image(
      TextureKeys.DropBottom,
      'src/Assets/Borders/dropbottom1.png'
    );
    this.load.image(TextureKeys.DropLoop, 'src/Assets/Borders/droploop1.png');
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
    // // console.log('preload finished');

    this.scene.start(SceneKeys.Game);
  }
}
