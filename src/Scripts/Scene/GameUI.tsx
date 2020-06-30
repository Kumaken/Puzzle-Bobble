import * as Phaser from 'phaser';

import ColorConfig from '../Config/ColorConfig';
import { SubscriptionLike } from 'rxjs';
import { IGameUI } from '../Interfaces/IGameUI';
import TimerUtil, { DISPLAY_MODE } from '../Util/TimerUtil';
import SceneKeys from '../Config/SceneKeys';
import AlignTool from '../Util/AlignTool';
import DescentController from '../Object/DescentController';
import FontKeys from '../Config/FontKeys';
import SFXController from '../Object/SFXController';

const DPR = window.devicePixelRatio;

export default class GameUI extends Phaser.Scene {
  public static level;

  private score = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private timePassed = 0;
  private timePassedText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private subscriptions: SubscriptionLike[] = [];
  private mouseCoordsText?: Phaser.GameObjects.Text;
  private countDownNextBubbleSpawnText?: Phaser.GameObjects.Text;
  private countdownNoteText?: Phaser.GameObjects.Text;
  private levelTextTween;
  private gameScene: Phaser.Scene;
  private isLevelUpWarningTinted: boolean;
  private isTimerWarningTinted: boolean;
  private sfxController?: SFXController;

  get _score(): number {
    return this.score;
  }

  constructor() {
    super({ key: SceneKeys.GameUI });
  }

  public setSFXController(sfxController: SFXController): void {
    this.sfxController = sfxController;
  }

  init(): void {
    GameUI.level = 1;
    this.score = 0;
    this.timePassed = 0;
    this.levelTextTween = undefined;
    this.isLevelUpWarningTinted = false;
    this.isTimerWarningTinted = false;
  }

  create(data?: IGameUI): void {
    this.gameScene = this.scene.get(SceneKeys.Game);

    const width = this.scale.width;
    this.add.rectangle(
      width * 0.5,
      0,
      width,
      100 * DPR,
      ColorConfig.Black,
      0.7
    );

    const offsetX = 10 * DPR;
    const offsetY = 10 * DPR;

    this.mouseCoordsText = this.add.text(offsetX, this.scale.height - 100, '', {
      fontSize: 22 * DPR,
      fontFamily: FontKeys.SHPinscherRegular
    });

    const startingText = this.createScoreText(this.score);
    this.scoreText = this.add.text(offsetX, offsetY, startingText, {
      fontSize: 22 * DPR,
      fontFamily: FontKeys.SHPinscherRegular
    });

    const rx = width - offsetX;
    const timePassedText = this.createTimePassedText(0);
    this.timePassedText = this.add
      .text(rx, offsetY, timePassedText, {
        fontSize: 22 * DPR,
        fontFamily: FontKeys.SHPinscherRegular
      })
      .setOrigin(1, 0);

    const levelText = this.createLevelText(1);
    this.levelText = this.add
      .text((rx - offsetX) / 2, offsetY, levelText, {
        fontSize: 22 * DPR,
        fontFamily: FontKeys.SHPinscherRegular
      })
      .setOrigin(1, 0);

    this.time.addEvent({
      delay: 1000, // ms
      callback: this.updateTime,
      callbackScope: this,
      loop: true
    });

    this.countdownNoteText = this.add
      .text(0, 0, 'Until next spawn', {
        fontSize: 30 * DPR,
        fontFamily: FontKeys.SHPinscherRegular
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.5);
    AlignTool.centerHorizontal(this.gameScene, this.countdownNoteText);
    AlignTool.alignY(this.gameScene, this.countdownNoteText, 0.625);

    const tempCountdown = this.createCountdown(100);
    this.countDownNextBubbleSpawnText = this.add
      .text(0, 0, tempCountdown, {
        fontSize: 150 * DPR,
        fontFamily: FontKeys.SHPinscherRegular
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.5);
    AlignTool.alignY(this.gameScene, this.countDownNextBubbleSpawnText, 0.7);
    AlignTool.centerHorizontal(
      this.gameScene,
      this.countDownNextBubbleSpawnText
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.length = 0;
    });

    this.initWithData(data);
  }

  private initWithData(data?: IGameUI) {
    if (!data) {
      return;
    }

    const destroyedSub = data.bubblesDestroyed?.subscribe((count) => {
      const multiplier = Math.max(1, count / 10);
      this.addToScore(Math.floor(count * multiplier));
    });

    const countdownSub = data.countdownChanged?.subscribe((cd) => {
      this.updateCountdown(cd);
    });

    const subs = [countdownSub, destroyedSub];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    subs.filter((sub) => sub).forEach((sub) => this.subscriptions.push(sub!));
  }

  private createScoreText(score: number) {
    return `Score: ${score.toLocaleString()}`;
  }

  private createLevelText(level: number) {
    return `Level: ${level.toLocaleString()}`;
  }

  private createCountdown(cd: number) {
    return `${TimerUtil.convertTime(cd, DISPLAY_MODE.SECOND)}`;
  }

  private updateCountdown(cd: number) {
    if (!this.countDownNextBubbleSpawnText) {
      return;
    }
    if (cd <= 10) {
      if (!this.isTimerWarningTinted) {
        this.isTimerWarningTinted = true;
        this.countDownNextBubbleSpawnText.setTint(
          0xff0000,
          0xffff00,
          0xffff00,
          0xffff00
        );
        this.countdownNoteText.setTint(0xff0000, 0xffff00, 0xffff00, 0xffff00);
      }
    } else {
      if (this.isTimerWarningTinted) {
        this.isTimerWarningTinted = false;
        this.countDownNextBubbleSpawnText.setTint(
          0xffffff,
          0xffffff,
          0xffffff,
          0xffffff
        );
        this.countdownNoteText.setTint(0xffffff, 0xffffff, 0xffffff, 0xffffff);
      }
    }
    this.countDownNextBubbleSpawnText.text = this.createCountdown(cd);
  }

  private addToScore(points: number) {
    this.score += points;
    this.updateScore(this.score);
  }

  private updateScore(score: number) {
    if (!this.scoreText) {
      return;
    }
    this.scoreText.text = this.createScoreText(score);
  }

  private createTimePassedText(seconds: number) {
    return `Time Passed ${TimerUtil.convertTime(seconds, DISPLAY_MODE.HOUR)}`;
  }

  private updateTime() {
    if (!this.timePassedText) {
      return;
    }

    this.timePassed += 1;
    this.timePassedText.text = this.createTimePassedText(this.timePassed);

    if (GameUI.level <= 20) this.levelUp(this.timePassed);
  }

  private levelUpTimes = [
    3, // time taken to level up to lvl 2
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
    110,
    120,
    130,
    140,
    150,
    160,
    170,
    180 // level 20 MAX
  ];

  private levelUp(timePassed) {
    if (
      GameUI.level + 1 ===
      DescentController.descentLevelSequence[DescentController.descentIndex]
    ) {
      if (!this.isLevelUpWarningTinted) {
        this.isLevelUpWarningTinted = true;
        this.levelText.setTint(0xff0000, 0xffff00, 0xffff00, 0xffff00);
      }
    } else {
      if (this.isLevelUpWarningTinted) {
        this.isLevelUpWarningTinted = false;
        this.levelText.setTint(0xffffff, 0xffffff, 0xffffff, 0xffffff);
      }
    }
    const timeUntilLevelUp = this.levelUpTimes[GameUI.level - 1] - timePassed;
    if (timeUntilLevelUp <= 5) {
      if (this.levelTextTween === undefined) this.blinkLevelText();
    } else if (this.levelTextTween !== undefined) {
      this.stopBlinkLevelText();
    }
    if (timeUntilLevelUp <= 0) {
      this.sfxController.playLevelUpSFX();
      this.updateLevel(++GameUI.level);
    }
  }

  private blinkLevelText() {
    this.levelTextTween = this.tweens.add({
      targets: this.levelText,
      duration: 300,
      alpha: 0,
      ease: 'Sine.easeInOut',
      callbackScope: this,
      yoyo: true,
      loop: -1
    });
  }

  private stopBlinkLevelText() {
    this.levelTextTween.remove();
    this.levelText.alpha = 1;
    this.levelTextTween = undefined;
  }

  // public updateMouseCoordsText(gamescene: Phaser.Scene): void {
  //   this.mouseCoordsText.text =
  //     Math.round(gamescene.game.input.mousePointer.x) +
  //     '/' +
  //     Math.round(gamescene.game.input.mousePointer.y);
  // }

  private updateLevel(level: number) {
    if (!level) {
      return;
    }
    this.levelText.text = this.createLevelText(level);
  }
}
