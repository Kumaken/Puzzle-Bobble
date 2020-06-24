import 'phaser';

import ColorConfig from '../Config/ColorConfig';
import { SubscriptionLike } from 'rxjs';
import { IGameUI } from '../Interfaces/IGameUI';
import TimerUtil, { DISPLAY_MODE } from '../Util/TimerUtil';
import SceneKeys from '../Config/SceneKeys';

const DPR = window.devicePixelRatio;

export default class GameUI extends Phaser.Scene {
  private score = 0;
  private scoreText?: Phaser.GameObjects.Text;

  private timePassed = 0;
  private timePassedText?: Phaser.GameObjects.Text;

  private level = 1;
  private subscriptions: SubscriptionLike[] = [];

  private mouseCoordsText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKeys.GameUI });
  }

  init() {
    this.score = 0;
    this.timePassed = 0;
  }

  create(data?: IGameUI) {
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
      fontFamily: 'SHPinscher-Regular'
    });

    const startingText = this.createScoreText(this.score);
    this.scoreText = this.add.text(offsetX, offsetY, startingText, {
      fontSize: 22 * DPR,
      fontFamily: 'SHPinscher-Regular'
    });

    const rx = width - offsetX;
    const infectionsText = this.createTimePassedText(0);
    this.timePassedText = this.add
      .text(rx, offsetY, infectionsText, {
        fontSize: 22 * DPR,
        fontFamily: 'SHPinscher-Regular'
      })
      .setOrigin(1, 0);

    this.time.addEvent({
      delay: 1000, // ms
      callback: this.updateTime,
      //args: [],
      callbackScope: this,
      loop: true
    });

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

    const destroyedSub = data.ballsDestroyed?.subscribe((count) => {
      const multiplier = Math.max(1, count / 10);
      this.addToScore(Math.floor(count * multiplier));
    });

    // const addedSub = data.ballsAdded?.subscribe((count) => {
    //   this.infections += count;
    //   this.updateInfections(this.infections);
    // });

    // const infectionsSub = data.infectionsChanged?.subscribe((count) => {
    //   this.infections = count;
    //   this.updateInfections(this.infections);
    // });

    const subs = [destroyedSub];
    subs.filter((sub) => sub).forEach((sub) => this.subscriptions.push(sub!));
  }

  private createScoreText(score: number) {
    return `Score: ${score.toLocaleString()}`;
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

  //   private createInfectionsText(infections: number) {
  //     return `${infections.toLocaleString()} Infections`;
  //   }

  private createTimePassedText(seconds: number) {
    return `Time Passed ${TimerUtil.convertTime(seconds, DISPLAY_MODE.HOUR)}`;
    // return `Time Passed ${Math.floor(seconds / 3600)}h : ${Math.floor(
    //   (seconds % 3600) / 60
    // )}m : ${Math.floor((seconds % 3600) % 60)}s `;
  }

  private updateTime() {
    if (!this.timePassedText) {
      return;
    }

    this.timePassed += 1;
    this.timePassedText.text = this.createTimePassedText(this.timePassed);
  }

  //   private updateInfections(count: number) {
  //     if (!this.infectionsText) {
  //       return;
  //     }

  //     this.infectionsText.text = this.createInfectionsText(count);
  //   }

  public updateMouseCoordsText(gamescene: Phaser.Scene) {
    this.mouseCoordsText.text =
      Math.round(gamescene.game.input.mousePointer.x) +
      '/' +
      Math.round(gamescene.game.input.mousePointer.y);
  }
}
