import { Observable } from 'rxjs';

interface IGameUI {
  ballsDestroyed?: Observable<number>;
  ballsAdded?: Observable<number>;
  infectionsChanged: Observable<number>;
}

export { IGameUI };
