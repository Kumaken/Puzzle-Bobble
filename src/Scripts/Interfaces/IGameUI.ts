import { Observable } from 'rxjs';

interface IGameUI {
  bubblesDestroyed?: Observable<number>;
  bubblesAdded?: Observable<number>;
  infectionsChanged: Observable<number>;
}

export { IGameUI };
