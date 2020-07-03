import { Observable } from 'rxjs';
import { IBubble } from './IBubble';
import { IBubblePool } from './IBubblePool';
import { IShotGuide } from './IShotGuide';

interface IShooter extends Phaser.GameObjects.Container {
  readonly shooterHeight: number;
  onShoot(): Observable<IBubble>;

  setBubblePool(pool: IBubblePool);
  setShooterGuide(guide: IShotGuide);

  prepareNextBubble(bubble?: IBubble);
  attachNextBubble();
  recycleBubble(bubble: IBubble);
  update(dt: number);
}

export { IShooter };
