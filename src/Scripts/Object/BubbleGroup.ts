import Bubble from './Bubble';
import { getRandomColor, Color, Colors } from '../Config/ColorConfig';

export class BubbleGroup {
  private bubbleArr = [[]];
  private rowNum: number;
  private columnNum: number;
  private rowOffset: number;
  private rowHeight: number;
  private tileWidth: number;

  constructor(scene: Phaser.Scene) {
    this.rowNum = 2;
    this.columnNum = 10;
    this.tileWidth = 30;
    this.rowHeight = 40;

    for (let i = 0; i < this.columnNum; ++i) {
      let bubble;
      bubble = new Bubble(scene, 0, 0, getRandomColor());
      this.bubbleArr.push(bubble);
    }
  }

  public getTileCoordinate(row, col) {
    var tilex = col * this.tileWidth;

    // X offset for odd or even rows
    if ((row + this.rowOffset) % 2) {
      tilex += this.tileWidth / 2;
    }

    var tiley = row * this.rowHeight;
    return { tilex: tilex, tiley: tiley };
  }

  public renderTiles() {
    // Top to bottom
    for (let j = 0; j < this.rowNum; j++) {
      for (let i = 0; i < this.columnNum; i++) {
        // Get the tile
        let tile: Bubble = this.bubbleArr[i][j];

        // Calculate the tile coordinates
        let coord = this.getTileCoordinate(i, j);

        // Draw the tile
        tile.moveBubble(coord.tilex, coord.tiley);
      }
    }
  }
}
