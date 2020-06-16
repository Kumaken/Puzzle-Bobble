import { IBubble } from '../Interfaces/IBubble';
import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';

export const Red = 'r';
export const Blu = 'b';
export const Gre = 'g';
export const Yel = 'y';

const AllColors = [Red, Blu, Gre, Yel];

export default class BubbleLayoutData {
  private growthModel: IBubbleSpawnModel;

  constructor(growthModel: IBubbleSpawnModel) {
    this.growthModel = growthModel;
  }

  getNextRow() {
    const count = this.growthModel.getNext(6);

    // TODO: potentially randomize positions when less than 6 available

    const ret: string[] = [];
    for (let i = 0; i < count; ++i) {
      ret.push(this.getRandomColor());
    }
    return ret;
  }

  private getRandomColor() {
    const size = AllColors.length;
    const r = Math.floor(Math.random() * size);
    return AllColors[r];
  }
}
