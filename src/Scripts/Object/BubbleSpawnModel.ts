import { BehaviorSubject } from 'rxjs';
import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';

export default class BubbleSpawnModel implements IBubbleSpawnModel {
  private accumulatedTime = 0;
  private populationCount = 0;

  private populationChangedSubject: BehaviorSubject<number>;

  get population() {
    return this.populationCount;
  }

  constructor(initialPopulation = 0) {
    this.populationCount = initialPopulation;
    this.populationChangedSubject = new BehaviorSubject<number>(
      initialPopulation
    );
  }

  onPopulationChanged() {
    return this.populationChangedSubject.asObservable();
  }

  getNext(count: number) {
    if (count > this.populationCount) {
      const total = this.populationCount;
      this.decreatePopulation(total);
      return total;
    }

    this.decreatePopulation(count);
    return count;
  }

  update(dt: number) {
    //   if (this.populationCount <= 0) {
    //     return;
    //   }
    //   this.accumulatedTime += dt;
    //   const rate = this.getBubbleSpawnRate();
    //   if (this.accumulatedTime < rate) {
    //     return;
    //   }
    // Descend!
    // increase by 10% of population
    // const increase = Math.floor(this.populationCount * 0.1);
    // this.increasePopulation(increase);
    // this.accumulatedTime = this.accumulatedTime - rate;
  }

  public static getBubbleSpawnRate(level: number) {
    if (level <= 2) {
      return 2000;
    }
    if (level <= 5) {
      return 3000;
    }

    return 5500;
  }

  private increasePopulation(amount: number) {
    if (this.populationCount + amount >= Number.MAX_SAFE_INTEGER) {
      return;
    }

    this.populationCount += amount;
    this.populationChangedSubject.next(this.populationCount);
  }

  private decreatePopulation(amount: number) {
    if (this.populationCount - amount < 0) {
      amount = this.populationCount;
    }

    this.populationCount -= amount;
    this.populationChangedSubject.next(this.populationCount);
  }
}
