import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';

export default class BubbleSpawnModel implements IBubbleSpawnModel {
  public getBubbleSpawnRate(level: number): number {
    // how long the player has until a row of bubble is spawned topmost. Gets shorter the higher the level is
    if (level < 2) {
      return 20000;
    }
    if (level <= 5) {
      return 18000;
    }
    if (level <= 8) {
      return 15000;
    }
    if (level <= 13) {
      return 12000;
    }
    if (level <= 15) {
      return 11000;
    }
    if (level <= 18) {
      return 10000;
    }
    if (level <= 19) {
      return 8000;
    }
    if (level <= 20) {
      return 6000;
    }

    // level higher than 20
    return 5000;
  }
}
