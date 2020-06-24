import 'phaser';
import BubbleGrid from './BubbleGrid';
import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';
import { SubscriptionLike, Subject, Observable } from 'rxjs';
import BubbleSpawnModel from './BubbleSpawnModel';

enum DescentState {
  Descending,
  Reversing,
  Holding
}

export default class DescentController {
  private scene: Phaser.Scene;
  private BubbleGrid: BubbleGrid;
  private growthModel: IBubbleSpawnModel;

  private speed: number;

  private state = DescentState.Descending;

  private subscriptions: SubscriptionLike[] = [];

  private reversingSubject = new Subject<void>();

  private accumulatedTime = 0;

  get yPosition(): number {
    return this.BubbleGrid.bottom;
  }

  private bubbleInterval: number;

  constructor(
    scene: Phaser.Scene,
    grid: BubbleGrid,
    growthModel: IBubbleSpawnModel,
    bubbleInterval: number
  ) {
    this.scene = scene;
    this.BubbleGrid = grid;
    this.growthModel = growthModel;
    this.bubbleInterval = bubbleInterval;
    const bds = this.BubbleGrid.onBubblesDestroyed().subscribe((count) => {
      this.handleBubblesDestroyed(count);
    });

    const pcs = this.growthModel.onPopulationChanged().subscribe((count) => {
      this.handleVirusPopulationChanged(count);
    });

    this.subscriptions = [bds, pcs];
  }

  destroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.length = 0;
  }

  setStartingDescent(dy: number) {
    this.BubbleGrid.moveBy(dy);
  }

  hold() {
    this.state = DescentState.Holding;
  }

  descend() {
    this.state = DescentState.Descending;
  }

  reversing() {
    if (this.state !== DescentState.Reversing) {
      return new Promise((resolve) => {
        resolve();
      });
    }

    return new Promise((resolve) => {
      this.reversingSubject.asObservable().subscribe(resolve);
    });
  }

  update(dt: number) {
    this.accumulatedTime += dt;

    const rate = BubbleSpawnModel.getBubbleSpawnRate(1);
    if (this.accumulatedTime > rate) {
      this.BubbleGrid.moveBy(this.bubbleInterval);
      this.BubbleGrid.spawnRow();
      this.accumulatedTime = 0;
    }
  }

  private handleBubblesDestroyed(count: number) {
    this.state = DescentState.Reversing;

    let dy = count;
    if (count > 10) {
      dy *= Math.min(count / 10, 3);
    }

    const grid = this.BubbleGrid;
    const bottom = grid.bottom;

    this.scene.tweens.addCounter({
      from: bottom,
      to: bottom - dy,
      duration: 300,
      ease: 'Back.easeOut',
      onUpdate: function (tween: Phaser.Tweens.Tween) {
        const v = tween.getValue();
        const diff = v - grid.bottom;
        grid.moveBy(diff);
      },
      onUpdateScope: this,
      onComplete: function () {
        // if state is no longer Reversing then don't change
        if (this.state === DescentState.Reversing) {
          this.state = DescentState.Descending;
        }
        this.reversingSubject.next();
      },
      onCompleteScope: this
    });
  }

  private handleVirusPopulationChanged(count: number) {
    const s = Math.max(0.3, Math.log(count * 0.0004));
    this.speed = s > 1.1 ? 1.1 : s;
  }
}
