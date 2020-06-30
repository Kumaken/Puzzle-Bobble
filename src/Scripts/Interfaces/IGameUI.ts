import { Observable } from 'rxjs';

interface IGameUI {
  bubblesDestroyed?: Observable<number>;
  countdownChanged?: Observable<number>;
}

export { IGameUI };
