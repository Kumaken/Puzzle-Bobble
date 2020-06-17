import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';
import BubbleColorConfig from '../Config/BubbleColorConfig';

const ALL_COLORS = [
  BubbleColorConfig.Red,
  BubbleColorConfig.Blue,
  BubbleColorConfig.Green,
  BubbleColorConfig.Yellow,
  BubbleColorConfig.White,
  BubbleColorConfig.Black,
  BubbleColorConfig.Purple
];

export default class BubbleLayoutData {
  private growthModel: IBubbleSpawnModel;
  private bubblesPerRow: number;

  constructor(growthModel: IBubbleSpawnModel) {
    this.growthModel = growthModel;
    this.bubblesPerRow = 10;
  }

  getNextRow(isRowStaggered: boolean): BubbleColorConfig[] {
    let bubblePerRow = this.bubblesPerRow;
    if (isRowStaggered) bubblePerRow -= 1;
    const count = this.growthModel.getNext(bubblePerRow);

    // TODO: potentially randomize positions when less than 6 available

    const ret: BubbleColorConfig[] = [];
    for (let i = 0; i < count; ++i) {
      ret.push(this.getRandomColor());
    }

    if (isRowStaggered) ret.push(undefined);
    return ret;
  }

  private getRandomColor() {
    const size = ALL_COLORS.length;
    const r = Math.floor(Math.random() * size);
    return ALL_COLORS[r];
  }
}
