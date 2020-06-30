import * as Phaser from 'phaser';

import ColorConfig from '../Config/ColorConfig';
import { primaryButton } from '../Util/Buttons';
import SceneKeys from '../Config/SceneKeys';

import { Subject } from 'rxjs';
import SFXController from '../Object/SFXController';
import AlignTool from '../Util/AlignTool';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../Util/Constant';
import FontKeys from '../Config/FontKeys';

export default class GameOver extends Phaser.Scene {
  private sfxController?: SFXController;
  private uiClickSubject = new Subject<void>();
  private enterSubject = new Subject<void>();
  private score = 0;

  init(data: { score: number }): void {
    this.score = data.score;
    this.sfxController = new SFXController(this.sound);
    this.sfxController.handleUIClick(this.uiClickSubject.asObservable());
    this.sfxController.handleGameOverEnter(this.enterSubject.asObservable());
  }

  create(): void {
    this.scene.bringToTop(SceneKeys.GameOver);
    const width = DEFAULT_WIDTH;
    const height = DEFAULT_HEIGHT;
    const x = AlignTool.getCenterHorizontal(this);
    const y = AlignTool.getCenterVertical(this);

    // add dark transparent overlay
    this.add.rectangle(x, y, width, height, ColorConfig.Black, 0.8);

    const fontSize = Math.min(width * 0.15, 225);
    const title = this.add
      .text(x, height * 0.25, 'Game\nOver', {
        fontFamily: FontKeys.SilkScreenA,
        fontSize,
        align: 'center',
        stroke: ColorConfig.Black,
        strokeThickness: 8
      })
      .setOrigin(0.5, 0.5)
      .setScale(0, 0);

    const scoreFontSize = fontSize * 0.25;
    const scoreLabel = this.add
      .text(x, height * 0.4, `your score:`, {
        fontFamily: FontKeys.SilkScreenA,
        scoreFontSize,
        align: 'center',
        stroke: ColorConfig.Black,
        strokeThickness: 8
      })
      .setOrigin(0.5, 0.5)
      .setScale(0, 0);

    const score = this.add
      .text(x, height * 0.45, `${this.score}`, {
        fontFamily: FontKeys.SilkScreenA,
        fontSize,
        align: 'center',
        stroke: ColorConfig.Black,
        strokeThickness: 8
      })
      .setOrigin(0.5, 0.5)
      .setScale(0, 0);

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

    // const exitBtn = this.add
    //   .dom(x, tryAgainBtn.y + tryAgainBtn.height + 20, button('Back to Title'))
    //   .setScale(0, 0)
    //   .addListener('click')
    //   .on('click', () => {
    //     this.uiClickSubject.next();

    //     this.scene.stop(SceneKeys.Game);

    //     this.scene.start(SceneKeys.TitleScreen, {
    //       target: SceneKeys.TitleScreen
    //     });
    //   });

    const timeline = this.tweens.timeline();

    timeline.add({
      targets: title,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 300
    });

    timeline.add({
      targets: scoreLabel,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 300
    });

    timeline.add({
      targets: score,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 100
    });

    timeline.add({
      targets: tryAgainBtn,
      scale: 1,
      ease: 'Back.easeOut',
      duration: 300
    });

    // timeline.add({
    //   targets: exitBtn,
    //   scale: 1,
    //   ease: 'Back.easeOut',
    //   duration: 300
    // });

    timeline.play();

    this.enterSubject.next();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.sfxController?.destroy();
    });
  }
}
