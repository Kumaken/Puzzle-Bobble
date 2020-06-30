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
  private bubbleSpawnModel: IBubbleSpawnModel;
  private bubblesPerRow: number;

  constructor(bubbleSpawnModel: IBubbleSpawnModel, bubblesPerRow: number) {
    this.bubbleSpawnModel = bubbleSpawnModel;
    this.bubblesPerRow = bubblesPerRow;
  }

  generateNextRow(isRowStaggered: boolean): ColorConfig[] {
    let bubblePerRow = this.bubblesPerRow;
    if (isRowStaggered) bubblePerRow -= 1;

    const ret: ColorConfig[] = [];
    for (let i = 0; i < bubblePerRow; ++i) {
      ret.push(this.randomizeColor());
    }

    if (isRowStaggered) ret.push(undefined);
    return ret;
  }

  private randomizeColor() {
    const size = ALL_COLORS.length;
    const r = Math.floor(Math.random() * size);
    return ALL_COLORS[r];
  }
}
