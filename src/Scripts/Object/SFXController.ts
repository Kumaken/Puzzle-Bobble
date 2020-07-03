import * as Phaser from 'phaser';
import { Observable, SubscriptionLike } from 'rxjs';
import AudioKeys from '../Config/AudioKeys';
import * as lodash from 'lodash';
import { IBubble } from '../Interfaces/IBubble';

export default class SFXController {
  private sound: Phaser.Sound.BaseSoundManager;
  private subscriptions: SubscriptionLike[] = [];
  constructor(sound: Phaser.Sound.BaseSoundManager) {
    this.sound = sound;
  }

  destroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.length = 0;
  }

  stopAllAudio(): void {
    this.sound.stopAll();
  }

  playBGMMusic(): void {
    this.sound.play(AudioKeys.InGameBGM, {
      loop: true,
      volume: 0.35
    });
  }

  playDescendSFX(): void {
    this.sound.play(AudioKeys.Descend, {
      volume: 0.5
    });
  }

  playSpawnBubbleSFX(): void {
    this.sound.play(AudioKeys.BubbleSpawn, {
      volume: 0.5
    });
  }

  playLevelUpSFX(): void {
    this.sound.play(AudioKeys.LevelUp, {
      volume: 0.5
    });
  }

  handleShootBubble(onShoot: Observable<IBubble>): void {
    const sub = onShoot.subscribe(() => {
      this.sound.play(AudioKeys.BubbleShoot, {
        volume: 0.5
      });
    });

    this.subscriptions.push(sub);
  }

  handleBubbleAttached(attached: Observable<IBubble>): void {
    const sub = attached.subscribe(() => {
      this.sound.play(AudioKeys.BubbleAttach, {
        volume: 0.5
      });
    });

    this.subscriptions.push(sub);
  }

  handleClearMatches(clearMatches: Observable<number>): void {
    const sub = clearMatches.subscribe((count) => {
      this.sound.play(AudioKeys.BubblePop, {
        volume: count > 3 ? 0.4 : 0.7
      });

      if (count > 3) {
        this.sound.play(AudioKeys.BubblePop, {
          volume: 0.7
        });
      }
    });

    this.subscriptions.push(sub);
  }

  handleClearDangling(clearDangling: Observable<IBubble>): void {
    const sub = clearDangling.subscribe(
      lodash.debounce(() => {
        this.sound.play(AudioKeys.BubbleWhoop, {
          volume: 0.2
        });
      }, 10)
    );

    this.subscriptions.push(sub);
  }

  handleGameOverEnter(gameOverEnter: Observable<void>): void {
    const sub = gameOverEnter.subscribe(() => {
      this.sound.play(AudioKeys.GameOver);
    });

    this.subscriptions.push(sub);
  }

  handleUIClick(uiClick: Observable<void>): void {
    const sub = uiClick.subscribe(() => {
      this.sound.play(AudioKeys.Click, {
        volume: 0.5
      });
    });

    this.subscriptions.push(sub);
  }
}
