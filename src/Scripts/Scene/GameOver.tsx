import * as Phaser from 'phaser';

import ColorConfig from '../Config/ColorConfig';

import button, { primaryButton } from '../Util/Buttons';
// import TextureKeys from '../Config/TextureKeys';
import SceneKeys from '../Config/SceneKeys';

import { Subject } from 'rxjs';

export default class GameOver extends Phaser.Scene {
  //   private sfx?: SoundEffectsController;
  private uiClickSubject = new Subject<void>();
  private enterSubject = new Subject<void>();

  //   init() {
  //     this.sfx = new SoundEffectsController(this.sound);
  //     this.sfx.handleUIClick(this.uiClickSubject.asObservable());
  //     this.sfx.handleGameOverEnter(this.enterSubject.asObservable());
  //   }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const x = width * 0.5;
    const y = height * 0.5;

    // add dark transparent overlay
    this.add.rectangle(x, y, width, height, ColorConfig.Black, 0.7);

    const fontSize = Math.min(width * 0.15, 225);
    const title = this.add
      .text(x, height * 0.4, 'Game\nOver', {
        fontFamily: 'SilkscreenA',
        fontSize,
        color: '#eb4034',
        align: 'center',
        stroke: ColorConfig.Black,
        strokeThickness: 8
      })
      .setOrigin(0.5, 0.5)
      .setScale(0, 0);

    // const style = {
    //   width: '220px',
    //   height: '100px',
    //   font: '48px Arial',
    //   'font-weight': 'bold'
    // };

    const tryAgainBtn = this.add
      .dom(x, height * 0.6, primaryButton('Retry'))
      .setScale(0, 0)
      .addListener('click')
      .on('click', () => {
        this.uiClickSubject.next();

        this.scene.stop(SceneKeys.Game);
        this.scene.start(SceneKeys.Game, {
          target: SceneKeys.Game
        });
      });

    const exitBtn = this.add
      .dom(x, tryAgainBtn.y + tryAgainBtn.height + 20, button('Back to Title'))
      .setScale(0, 0)
      .addListener('click')
      .on('click', () => {
        this.uiClickSubject.next();

        this.scene.stop(SceneKeys.Game);

        this.scene.start(SceneKeys.TitleScreen, {
          target: SceneKeys.TitleScreen
        });
      });

    const timeline = this.tweens.timeline();

    timeline.add({
      targets: title,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 300
    });

    timeline.add({
      targets: tryAgainBtn,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 300
    });

    timeline.add({
      targets: exitBtn,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 300
    });

    timeline.play();

    this.enterSubject.next();

    // this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    //   this.sfx?.destroy();
    // });
  }
}
