import * as Phaser from 'phaser';
import TextureKeys from '../Config/TextureKeys';
import SceneKeys from '../Config/SceneKeys';
import GameEvents from '../Config/GameEvents';
import AnimationKeys from '../Config/AnimationKeys';
import AudioKeys from '../Config/AudioKeys';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.Preload });
  }

  preload(): void {
    /* all the routes here is referenced from root! */
    // Load bubbles:
    // for(let i=0; i<8; i++){
    //   this.load.image(TextureKeys.BubbleRed, 'src/Assets/Bubbles/red_bubble/.png');
    // }
    this.bubbleTextures.forEach((texture) => {
      this.load.atlas(
        texture,
        `src/Assets/Bubbles/${texture}/${texture}.png`,
        `src/Assets/Bubbles/${texture}/${texture}.json`
      );
    });

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

    // BG:
    this.load.image(TextureKeys.BaseBackground, 'src/Assets/BG/bkgd_0.png');
    for (let i = 1; i <= 7; i++) {
      this.load.image(TextureKeys[`Layer${i}`], `src/Assets/BG/bkgd_${i}.png`);
    }

    // Audio:
    // BGM:
    this.load.audio(AudioKeys.InGameBGM, 'src/Assets/Audio/d2_cyberdance.mp3');
    this.load.audio(AudioKeys.BubbleShoot, 'src/Assets/Audio/bubble_shoot.wav');
    this.load.audio(
      AudioKeys.BubbleAttach,
      'src/Assets/Audio/bubble_attach.wav'
    );
    this.load.audio(AudioKeys.BubblePop, 'src/Assets/Audio/bubble_pop.wav');
    this.load.audio(AudioKeys.GameOver, 'src/Assets/Audio/gameover.wav');
    this.load.audio(AudioKeys.Click, 'src/Assets/Audio/click.wav');
    this.load.audio(AudioKeys.BubbleWhoop, 'src/Assets/Audio/bubble_whoop.wav');
  }

  create(): void {
    this.game.events.emit(GameEvents.PreloadFinished);
    this.prepareBubbleAnimation();
  }

  private bubbleTextures = [
    TextureKeys.BubbleRed,
    TextureKeys.BubbleBlue,
    TextureKeys.BubbleGreen,
    TextureKeys.BubbleYellow,
    TextureKeys.BubblePurple,
    TextureKeys.BubbleWhite,
    TextureKeys.BubbleBlack
  ];

  private prepareBubbleAnimation() {
    this.bubbleTextures.forEach((texture) => {
      let BubbleFrames;
      if (texture === TextureKeys.BubbleGreen)
        BubbleFrames = this.anims.generateFrameNames(texture, {
          start: 0,
          end: 3,
          zeroPad: 0,
          suffix: '.png'
        });
      else if (texture === TextureKeys.BubbleBlack)
        BubbleFrames = this.anims.generateFrameNames(texture, {
          start: 0,
          end: 4,
          zeroPad: 0,
          suffix: '.png'
        });
      else
        BubbleFrames = this.anims.generateFrameNames(texture, {
          start: 0,
          end: 7,
          zeroPad: 0,
          suffix: '.png'
        });

      this.anims.create({
        key: `${texture}_idle`,
        frames: BubbleFrames,
        frameRate: 6,
        repeat: -1
      });
    });
  }

  private handlePreloadFinished() {
    this.scene.stop(SceneKeys.Preload);
    console.log('preload finished');

    this.scene.start(SceneKeys.Game);
  }
}
