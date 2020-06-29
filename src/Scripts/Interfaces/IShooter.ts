import { Observable } from 'rxjs';
import { IBubble } from './IBubble';
import { IBubblePool } from './IBubblePool';
import { IShotGuide } from './IShotGuide';

interface IShooter extends Phaser.GameObjects.Container {
  readonly radius: number;
  readonly shooterHeight: number;
  onShoot(): Observable<IBubble>;

  setBubblePool(pool: IBubblePool);
  setGuide(guide: IShotGuide);

  attachBubble(bubble?: IBubble);
  attachNextBubble();
  returnBubble(bubble: IBubble);
  update(dt: number);
}

export { IShooter };
