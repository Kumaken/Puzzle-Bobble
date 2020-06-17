import { Observable } from 'rxjs';

interface IBubbleSpawnModel {
  readonly population: number;

  getNext(count: number): number;
  onPopulationChanged(): Observable<number>;
  update(dt: number);
}

export { IBubbleSpawnModel };
