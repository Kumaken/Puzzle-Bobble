import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';
import ColorConfig from '../Config/ColorConfig';

const ALL_COLORS = [
  ColorConfig.Red,
  ColorConfig.Blue,
  ColorConfig.Green,
  ColorConfig.Yellow,
  ColorConfig.White,
  ColorConfig.Black,
  ColorConfig.Purple
];

export default class BubbleLayoutData {
  private growthModel: IBubbleSpawnModel;
  private bubblesPerRow: number;

  constructor(growthModel: IBubbleSpawnModel) {
    this.growthModel = growthModel;
    this.bubblesPerRow = 10;
  }

  getNextRow(isRowStaggered: boolean): ColorConfig[] {
    let bubblePerRow = this.bubblesPerRow;
    if (isRowStaggered) bubblePerRow -= 1;
    const count = this.growthModel.getNext(bubblePerRow);

    // TODO: potentially randomize positions when less than 6 available

    const ret: ColorConfig[] = [];
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
