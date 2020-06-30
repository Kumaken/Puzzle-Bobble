import 'phaser';
import BubbleGrid from './BubbleGrid';
import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';
import Shooter from './Shooter';
import GameUI from '../Scene/GameUI';
import SceneKeys from '../Config/SceneKeys';
import LevelScene from '../Scene/LevelScene';
import { Observable, BehaviorSubject } from 'rxjs';
import SFXController from './SFXController';

export default class DescentController {
  private scene: Phaser.Scene;
  private BubbleGrid: BubbleGrid;
  private bubbleSpawnModel: IBubbleSpawnModel;
  private accumulatedTime = 0;
  private countdownSubject: BehaviorSubject<number>;
  private sfxController?: SFXController;

  onCountdownChanged(): Observable<number> {
    return this.countdownSubject.asObservable();
  }

  destroy(): void {
    this.countdownSubject.complete();
  }

  constructor(
    scene: Phaser.Scene,
    grid: BubbleGrid,
    bubbleSpawnModel: IBubbleSpawnModel,
    sfxController: SFXController
  ) {
    this.scene = scene;
    this.BubbleGrid = grid;
    this.bubbleSpawnModel = bubbleSpawnModel;
    DescentController.descentIndex = 0;
    this.countdownSubject = new BehaviorSubject<number>(0);
    this.sfxController = sfxController;
  }

  setInitialDescent(dy: number): void {
    this.BubbleGrid.descendBy(dy);
  }

  // at what levels should the topmost border descend?
  static descentLevelSequence = [2, 5, 7, 9, 12, 15, 17, 18, 19, 20];
  static descentIndex = 0;

  update(dt: number): void {
    this.accumulatedTime += dt;
    const rate = this.bubbleSpawnModel.getBubbleSpawnRate(GameUI.level);
    const countdown = Math.floor((rate - this.accumulatedTime) / 1000); // in seconds
    if (countdown >= 0) this.countdownSubject.next(countdown);

    if (this.accumulatedTime > rate && !Shooter.isShooting) {
      this.accumulatedTime = 0;
      this.BubbleGrid.spawnNextWave();
      this.sfxController.playSpawnBubbleSFX();
    }

    if (
      DescentController.descentIndex >=
        DescentController.descentLevelSequence.length ||
      Shooter.isShooting
    ) {
      return;
    }
    if (
      GameUI.level >=
      DescentController.descentLevelSequence[DescentController.descentIndex]
    ) {
      this.BubbleGrid.descend();
      this.updateSceneWorldBounds();
      this.sfxController.playDescendSFX();
      DescentController.descentIndex++;
    }
  }

  private updateSceneWorldBounds() {
    const gameScene = this.scene.scene.get(SceneKeys.Game) as LevelScene;
    gameScene.descendWorldBounds();
  }
}
