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

  destroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.length = 0;
  }

  handleShootBubble(onShoot: Observable<IBubble>) {
    const sub = onShoot.subscribe(() => {
      this.sound.play(AudioKeys.BubbleShoot, {
        volume: 0.3
      });
    });

    this.subscriptions.push(sub);
  }

  handleBubbleAttached(attached: Observable<IBubble>) {
    const sub = attached.subscribe(() => {
      this.sound.play(AudioKeys.BubbleAttach, {
        volume: 0.2
      });
    });

    this.subscriptions.push(sub);
  }

  handleClearMatches(clearMatches: Observable<number>) {
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

  handleClearOrphan(clearOrphan: Observable<IBubble>) {
    const sub = clearOrphan.subscribe(
      lodash.debounce(() => {
        this.sound.play(AudioKeys.BubbleWhoop, {
          volume: 0.2
        });
      }, 10)
    );

    this.subscriptions.push(sub);
  }

  handleGameOverEnter(gameOverEnter: Observable<void>) {
    const sub = gameOverEnter.subscribe(() => {
      this.sound.play(AudioKeys.GameOver);
    });

    this.subscriptions.push(sub);
  }

  handleUIClick(uiClick: Observable<void>) {
    const sub = uiClick.subscribe(() => {
      this.sound.play(AudioKeys.Click, {
        volume: 0.5
      });
    });

    this.subscriptions.push(sub);
  }
}
