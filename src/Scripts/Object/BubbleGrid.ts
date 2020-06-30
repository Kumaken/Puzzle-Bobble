import 'phaser';

import BubbleLayoutData from './BubbleLayoutData';
import { colorMatches } from '../Config/ColorConfig';
import { Subject, Observable } from 'rxjs';
import { IBubble } from '../Interfaces/IBubble';
import { IStaticBubblePool } from '../Interfaces/IStaticBubblePool';
import ColorConfig from '../Config/ColorConfig';
import TextureKeys from '../Config/TextureKeys';
import Shooter from './Shooter';
import AlignTool from '../Util/AlignTool';
import { DEFAULT_HEIGHT } from '../Util/Constant';

interface IGridPosition {
  row: number;
  col: number;
}

type IBubbleOrNone = IBubble | undefined;

class RowArray extends Array<IBubbleOrNone> {
  isStaggered = false;
}

export default class BubbleGrid {
  private scene: Phaser.Scene;
  private pool: IStaticBubblePool;
  private bubbleLayoutData?: BubbleLayoutData;
  // Individual Bubble Properties
  private bubbleSize: Phaser.Structs.Size;
  private bubblesCount = 0;
  // Bubble grid properties
  private grid: IBubbleOrNone[][] = [];
  private bubblesPerRow: number;
  private midPoint: number;
  public gridWidth: number;
  public gridHeight: number;
  public gridX: number;
  public effGridX: number;
  public gridRightX: number;
  public effGridRightX: number;
  public gridY: number;
  public effGridY: number;
  private bubbleLeftmostX: number;
  private bubbleRightmostX: number;
  public sideGap = 3;
  // Descend Properties
  public descentInterval: number;
  // Border Frame Properties
  public borderWidth = 22;
  // Subscription
  private bubblesDestroyedSubject = new Subject<number>();
  private bubbleWillBeDestroyed = new Subject<IBubble>();
  private danglingWillBeDestroyed = new Subject<IBubble>();
  private bubbleAttachedSubject = new Subject<IBubble>();

  /**
   * Gets total active bubbles in the game
   */
  get bubbleCount(): number {
    return this.bubblesCount;
  }

  /**
   * Gets the total height value of the grid
   */
  get height(): number {
    this.removeEmptyRows();
    return this.grid.length * this.bubbleInterval;
  }

  /**
   * Gets y value of height interval at every bubble row
   */
  get bubbleInterval(): number {
    return this.bubbleSize.height;
  }

  /**
   * Gets the height where the last row is (most bottom)
   */
  get gridBottom(): number {
    if (this.grid.length <= 0) {
      return 0;
    }
    const bubble = this.grid[this.grid.length - 1].find((n) => n);
    if (!bubble) {
      return 0;
    }
    return bubble.y + bubble.radius;
  }

  constructor(
    scene: Phaser.Scene,
    pool: IStaticBubblePool,
    bubblesPerRow: number
  ) {
    this.scene = scene;
    this.pool = pool;
    this.bubblesPerRow = bubblesPerRow;
    const sample = this.pool.spawn(0, 0, null);
    this.bubbleSize = new Phaser.Structs.Size(sample.width, sample.height);
    this.pool.despawn(sample);

    this.midPoint = this.scene.scale.width * 0.5 + this.bubbleSize.width * 0.2;
    this.gridHeight = DEFAULT_HEIGHT;
    this.gridWidth =
      this.bubbleSize.width * bubblesPerRow + this.bubbleSize.width * 0.5;
    this.gridX =
      this.midPoint -
      this.bubblesPerRow * 0.5 * this.bubbleSize.width -
      this.bubbleSize.width * 0.5;
    this.gridY = 0;
    this.gridRightX = this.gridX + this.gridWidth;
    const topBorderIMG = scene.textures
      .get(TextureKeys.TopBorder)
      .getSourceImage();
    this.effGridY = topBorderIMG.height * 3;
    this.effGridX = this.gridX + this.borderWidth / 2 + this.sideGap;
    this.effGridRightX = this.gridRightX - this.borderWidth / 2 - this.sideGap;
    this.descentInterval =
      scene.textures.get(TextureKeys.DropLoop).getSourceImage().height * 3;

    this.bubbleLeftmostX = this.effGridX + this.bubbleSize.width / 2;
    this.bubbleRightmostX = this.effGridRightX - this.bubbleSize.width / 2;

    // spawn border:
    scene.add.tileSprite(
      this.gridX,
      AlignTool.getCenterVertical(this.scene),
      this.borderWidth,
      this.gridHeight,
      TextureKeys.LeftBorder
    );

    scene.add.tileSprite(
      this.gridRightX,
      AlignTool.getCenterVertical(this.scene), // center point
      this.borderWidth,
      this.gridHeight,
      TextureKeys.RightBorder
    );

    const topBorder = scene.add.tileSprite(
      (this.gridX + this.gridRightX) / 2,
      this.gridY + topBorderIMG.height * 1.5,
      this.gridWidth,
      topBorderIMG.height * 3,
      TextureKeys.TopBorder
    );
    topBorder.setDepth(1);
  }

  destroy(): void {
    this.bubblesDestroyedSubject.complete();
    this.bubbleWillBeDestroyed.complete();
  }

  setBubbleLayoutData(layout: BubbleLayoutData): this {
    this.bubbleLayoutData = layout;
    return this;
  }

  onBubblesDestroyed(): Observable<number> {
    return this.bubblesDestroyedSubject.asObservable();
  }

  onBubbleWillBeDestroyed(): Observable<IBubble> {
    return this.bubbleWillBeDestroyed.asObservable();
  }

  onDanglingWillBeDestroyed(): Observable<IBubble> {
    return this.danglingWillBeDestroyed.asObservable();
  }

  onBubbleAttached(): Observable<IBubble> {
    return this.bubbleAttachedSubject.asObservable();
  }

  setIsShootingFalse(): void {
    Shooter.isShooting = false;
  }

  async updateIsShootingTimer(ms: number): Promise<unknown> {
    return new Promise(() => setTimeout(this.setIsShootingFalse, ms));
  }

  /**
   *
   * @param x x position at collision with grid
   * @param y y position at collision with grid
   * @param color color bubble
   * @param gridBubble bubble in grid that was collided with
   * @param bvx x velocity of bubble at collision
   * @param bvy y velocity of bubble at collision
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async attachBubble(
    x: number,
    y: number,
    color: number,
    gridBubble: IBubble,
    bvx: number,
    bvy: number
  ) {
    const radius = this.bubbleSize.width * 0.5;

    const vel = new Phaser.Math.Vector2(bvx, bvy);
    vel.normalize();

    // the position on the bubble in the direction it was heading
    const hx = x + vel.x * radius;

    const cellX = gridBubble.x;
    const cellY = gridBubble.y;

    const dx = hx - cellX;

    let tx = dx <= 0 ? cellX - radius : cellX + radius;

    // offset by vertical interval
    const interval = this.bubbleInterval;
    const dy = y - cellY;
    let ty = dy >= 0 ? cellY + interval : cellY - interval;

    // place on same row
    const sameRow = Math.abs(dy) <= radius;
    if (sameRow) {
      ty = cellY;
      // adjust x to be next to
      tx = dx <= 0 ? tx - radius : tx + radius;
    }

    const { row, col } = this.findRowAndColumns(gridBubble);
    let bRow = -1;
    if (sameRow) {
      bRow = row;
    } else {
      if (ty < cellY) {
        bRow = row - 1;
      } else {
        bRow = row + 1;
      }
    }

    let bCol: number = col;
    const isLeft = tx < cellX;
    const isStaggered = this.isRowStaggered(bRow);
    if (sameRow) {
      if (isLeft) {
        if (isStaggered) {
          if (bCol !== 1) bCol -= 1;
        } else {
          if (bCol !== 0) bCol -= 1;
        }
      } else {
        if (bCol < this.bubblesPerRow - 1) bCol += 1;
      }
    } else {
      if (isStaggered) {
        if (!isLeft && bCol < this.bubblesPerRow - 1) bCol += 1;
      } else {
        if (isLeft) {
          if (bCol !== 0) bCol -= 1;
        }
      }
    }

    // console.lo('initialres:', bRow, bCol);

    // handle if destinated position already contains a bubble:
    if (this.getBubbleAt(bRow, bCol)) {
      // if previously same row -> go to next row:
      if (ty < cellY) {
        ty -= this.bubbleInterval;
        bRow = row - 1;
      } else {
        ty += this.bubbleInterval;
        bRow = row + 1;
      }
    }

    // Handle if tx or ty are out of grid boundaries
    if (tx < this.bubbleLeftmostX) {
      if (this.isRowStaggered(bRow))
        tx = this.bubbleLeftmostX + this.bubbleSize.width * 0.5;
      else tx = this.bubbleLeftmostX;
    }

    if (tx > this.bubbleRightmostX) {
      if (this.isRowStaggered(bRow))
        tx = this.bubbleRightmostX - this.bubbleSize.width * 0.5;
      else tx = this.bubbleRightmostX;
    }
    const newBubble = this.pool.spawn(x, y, color);
    this.attachBubbleAt(bRow, bCol, newBubble);

    const matches = this.findMatchesAt(bRow, bCol, color as number);

    this.updateIsShootingTimer(500); // hold next shooting for the animations to finish first
    // bubbles pop with minimum matches of 3
    if (matches.length < 3) {
      this.bubblesCount += 1;
      await this.animateBubbleAttach(bRow, bCol, tx, ty, newBubble);

      return;
    }
    // remove matched bubbles from grid but not visually yet
    const matchedBubbles = this.removeFromGrid(matches);
    // find
    const danglingPositions = this.findDangledBubbles();
    const danglingBubbles = this.removeFromGrid(danglingPositions).map(
      (bubble) => {
        bubble.setActive(false);
        this.scene.physics.world.remove(bubble.body);
        return bubble;
      }
    );

    this.removeEmptyRows();
    // Spawn new bubble animation:
    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: newBubble,
        y: ty,
        x: tx,
        duration: 50,
        ease: 'Back.easeOut',
        onComplete: function () {
          resolve();
        }
      });
    });

    const body = newBubble.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();

    // Remove matched bubbles
    matchedBubbles.forEach((bubble) => {
      this.bubbleWillBeDestroyed.next(bubble);
      this.pool.despawn(bubble);
    });

    const destroyedCount = matches.length + danglingBubbles.length;
    this.bubblesDestroyedSubject.next(destroyedCount);
    this.bubblesCount -= destroyedCount;

    // Animate falling dangling bubbles
    if (danglingBubbles.length > 0) {
      await this.animateBubbleFall(danglingBubbles);
    }
  }

  /**
   * Initial generation of bubbles
   * @param rows how many rows to generate initially to hold the bubbles. (INCLUDING PLACEHOLDER BUBBLE ROW)
   */
  generateInitialBubbles(rows = 6): this {
    if (!this.bubbleLayoutData) {
      return this;
    }
    for (let i = 0; i < rows; ++i) {
      this.generateBubbleRow();
    }

    return this;
  }

  descendBy(dy: number): this {
    if (this.pool.countActive() === 0) {
      return this;
    }

    const bubbles = this.pool.getChildren();
    const count = bubbles.length;
    for (let i = 0; i < count; ++i) {
      const b = bubbles[i] as IBubble;
      b.y += dy;

      const body = b.body as Phaser.Physics.Arcade.StaticBody;
      body.updateFromGameObject();
    }

    return this;
  }

  /**
   * Generates bubble on one row. Contains algorithm on whether to place bubble on another row or this row.
   * It generates a row of bubble to the top
   * Returns row number
   */
  generateBubbleRow(): number {
    // if bubble layout data is unavailable, terminate:
    if (!this.bubbleLayoutData) {
      return -1;
    }

    let currRowIsStaggered;
    if (this.grid.length <= 1) {
      if (this.grid.length == 0) currRowIsStaggered = false;
      else currRowIsStaggered = true;
    } else currRowIsStaggered = !this.isRowStaggered(2);
    const row = this.bubbleLayoutData.generateNextRow(currRowIsStaggered);
    const count = row.length;

    if (count <= 0) {
      return 0;
    }

    this.spawnBubbleRowTopmost(row, currRowIsStaggered);
    this.bubblesCount += count;
    return row.length;
  }

  private spawnBubbleRowTopmost(row: ColorConfig[], isStaggered: boolean) {
    const width = this.bubbleSize.width;
    const radius = width * 0.5;
    const verticalInterval = this.bubbleInterval;

    const count = row.length;

    const gridRow = new RowArray();
    this.grid.unshift(gridRow);

    const halfCount = count * 0.5;
    let x = this.midPoint - halfCount * width + radius * 0.5;
    let y = 0;

    gridRow.isStaggered = isStaggered;
    if (this.grid.length > 1) {
      const rowList = this.grid[1] as RowArray;
      const anyItem = rowList.find((n) => n);
      if (anyItem) {
        y = anyItem.y - verticalInterval;
      }
    }

    if (gridRow.isStaggered) {
      x += radius;
      // to handle the offset
      gridRow.push(undefined);
    }

    row.forEach((colorCode) => {
      if (colorCode) {
        const b = this.pool.spawn(x, y, colorCode);
        gridRow.push(b);
        x += width;
      } else {
        // skip
      }
    });
  }

  private removeFromGrid(matches: IGridPosition[]) {
    const bubbles: IBubble[] = [];
    const size = matches.length;
    for (let i = 0; i < size; ++i) {
      const { row, col } = matches[i];
      const bubble = this.getBubbleAt(row, col);

      if (!bubble) {
        console.warn(`match is not found anywhere.`);
        continue;
      }

      this.grid[row][col] = undefined;
      bubbles.push(bubble);
    }

    return bubbles;
  }

  private async animateBubbleFall(danglings: IBubble[]) {
    // fall down and fade-out
    const timeline = this.scene.tweens.timeline();
    const bottom = this.scene.scale.height * 0.9;

    const tasks = danglings.map((dangling) => {
      const y = dangling.y;
      const dy = bottom - y;
      const duration = dy * 0.75;

      return new Promise((resolve) => {
        timeline.add({
          targets: dangling,
          y: y + dy,
          offset: 0,
          duration,
          onComplete: function () {
            this.bubbleWillBeDestroyed.next(dangling);
            this.danglingWillBeDestroyed.next(dangling);
            this.pool.despawn(dangling);
            resolve();
          },
          onCompleteScope: this
        });
      });
    });

    timeline.play();
    await Promise.all(tasks);
  }

  private async animateBubbleAttach(
    row: number,
    col: number,
    tx: number,
    ty: number,
    newBubble: IBubble
  ) {
    // this timeline runs animation sequence sequentially
    const timeline = this.scene.tweens.createTimeline();
    timeline.add({
      targets: newBubble,
      y: ty - 5,
      duration: 50
    });
    timeline.add({
      targets: newBubble,
      x: tx,
      duration: 100,
      offset: 0
    });
    timeline.add({
      targets: newBubble,
      y: ty,
      duration: 50,
      ease: 'Back.easeOut',
      onComplete: () => {
        const body = newBubble.body as Phaser.Physics.Arcade.StaticBody;
        body.updateFromGameObject();
      }
    });

    await timeline.play();
    await this.jiggleAdjacentBubbles(row, col);
  }

  /**
   * Find the row of a bubble
   */
  private findRowAndColumns(bubble: IBubble) {
    // HEURISTIC: search from the bottom of the grid (more likely to find match early on)
    const size = this.grid.length;
    for (let i = size - 1; i >= 0; --i) {
      const row = this.grid[i];
      const colIdx = row.findIndex((b) => b === bubble);
      if (colIdx < 0) {
        // bubble is not found on this row
        continue;
      }
      return {
        row: i,
        col: colIdx
      };
    }
    // NOT FOUND ANYWHERE!
    return {
      row: -1,
      col: -1
    };
  }

  private attachBubbleAt(row: number, col: number, bubble: IBubble) {
    if (row >= this.grid.length) {
      const count = row - (this.grid.length - 1);
      for (let i = 0; i < count; ++i) {
        const rowList = new RowArray();
        const prevRow = this.grid[row + i - 1] as RowArray;
        rowList.isStaggered = !prevRow.isStaggered;
        this.grid.push(rowList);
      }
    }
    const rowList = this.grid[row];
    for (let i = 0; i <= col; ++i) {
      if (rowList.length <= i) {
        rowList[i] = undefined;
      }
    }
    rowList[col] = bubble;
  }

  private getBubbleAt(row: number, col: number) {
    if (row < 0) {
      return null;
    }
    if (row > this.grid.length - 1) {
      return null;
    }
    const rowList = this.grid[row];
    return rowList[col];
  }

  private findDangledBubbles() {
    // find all connected bubbles starting from the top row
    const connected = new Set<IBubble>();
    const rootPositions = this.grid[0]
      .map((n, idx) => {
        if (!n) {
          return undefined;
        }
        connected.add(n);
        return { row: 0, col: idx };
      })
      .filter((n) => n) as IGridPosition[];

    rootPositions.forEach(({ row, col }) => {
      this.findMatchesAt(row, col, ColorConfig.Any as number, connected);
    });

    // bubbles which are not in the connected set are dagling
    // ignore the first row as it is impossible for the bubbles there to be dangling
    const danglings: IGridPosition[] = [];
    const count = this.grid.length;
    for (let row = 1; row < count; ++row) {
      const list = this.grid[row];
      for (let col = 0; col < list.length; ++col) {
        const bubble = list[col];
        if (!bubble) {
          continue;
        }
        if (connected.has(bubble)) {
          continue;
        }
        danglings.push({
          row,
          col
        });
      }
    }
    return danglings;
  }

  private findMatchesAt(
    row: number,
    col: number,
    color: number,
    found: Set<IBubble> = new Set()
  ) {
    // BFS
    const isStaggered = this.isRowStaggered(row);
    const adjacentMatches: IGridPosition[] = [];

    // ignore bubbles on first row (placeholder hidden row)
    if (row - 1 !== 0) {
      // top left
      if (isStaggered) {
        const tl = this.getBubbleAt(row - 1, col - 1);
        if (tl && colorMatches(tl.color, color) && !found.has(tl)) {
          adjacentMatches.push({
            row: row - 1,
            col: col - 1
          });
          found.add(tl);
        }
      }

      // top
      const t = this.getBubbleAt(row - 1, col);
      if (t && colorMatches(t.color, color) && !found.has(t)) {
        adjacentMatches.push({
          row: row - 1,
          col
        });
        found.add(t);
      }

      // top right
      if (!isStaggered) {
        const tr = this.getBubbleAt(row - 1, col + 1);
        if (tr && colorMatches(tr.color, color) && !found.has(tr)) {
          adjacentMatches.push({
            row: row - 1,
            col: col + 1
          });
          found.add(tr);
        }
      }
    }
    // right
    const r = this.getBubbleAt(row, col + 1);
    if (r && colorMatches(r.color, color) && !found.has(r)) {
      adjacentMatches.push({
        row,
        col: col + 1
      });
      found.add(r);
    }

    // bottom right
    if (!isStaggered) {
      const br = this.getBubbleAt(row + 1, col + 1);
      if (br && colorMatches(br.color, color) && !found.has(br)) {
        adjacentMatches.push({
          row: row + 1,
          col: col + 1
        });
        found.add(br);
      }
    }

    // bottom
    const b = this.getBubbleAt(row + 1, col);
    if (b && colorMatches(b.color, color) && !found.has(b)) {
      adjacentMatches.push({
        row: row + 1,
        col
      });
      found.add(b);
    }

    // bottom left
    if (isStaggered) {
      const bl = this.getBubbleAt(row + 1, col - 1);
      if (bl && colorMatches(bl.color, color) && !found.has(bl)) {
        adjacentMatches.push({
          row: row + 1,
          col: col - 1
        });
        found.add(bl);
      }
    }

    // left
    const l = this.getBubbleAt(row, col - 1);
    if (l && colorMatches(l.color, color) && !found.has(l)) {
      adjacentMatches.push({
        row,
        col: col - 1
      });
      found.add(l);
    }

    adjacentMatches.forEach((pos) => {
      this.findMatchesAt(pos.row, pos.col, color, found).forEach((obj) =>
        adjacentMatches.push(obj)
      );
    });

    const missing = adjacentMatches.find(({ row, col }) => {
      return !this.getBubbleAt(row, col);
    });

    if (missing) {
      console.dir(missing);
    }

    return adjacentMatches;
  }

  private async jiggleAdjacentBubbles(sourceRow: number, sourceCol: number) {
    const sourceBubble = this.getBubbleAt(sourceRow, sourceCol);
    const firstNeightbors = this.getAdjacentBubbles(sourceRow, sourceCol);

    const secondTop = sourceRow - 1;

    const secondNeighbors = firstNeightbors.find(({ row }) => row === secondTop)
      ? this.getAdjacentBubbles(secondTop, sourceCol)
      : [];

    const degrees = [firstNeightbors, secondNeighbors];

    const size = degrees.length;
    for (let i = 0; i < size; ++i) {
      const deg = degrees[i];
      for (let j = 0; j < deg.length; ++j) {
        const { row, col } = deg[j];
        const bubble = this.getBubbleAt(row, col);
        if (!bubble || bubble === sourceBubble) {
          continue;
        }

        const factor = (size - i) / size;
        const movement = 10 * factor;

        const timeline = this.scene.tweens.createTimeline();
        const y = bubble.y;

        timeline.add({
          targets: bubble,
          y: y - movement,
          duration: 50
        });

        timeline.add({
          targets: bubble,
          y,
          duration: 50,
          ease: 'Back.easeOut'
        });

        await timeline.play();
      }
    }
  }

  private getAdjacentBubbles(row: number, col: number, includeBottom = false) {
    const positions = this.getAdjacentBubblePositions(
      row,
      col,
      1,
      includeBottom
    );
    const neighbors = positions
      .map(({ row, col }) => {
        const n = this.getBubbleAt(row, col);
        if (!n) {
          return undefined;
        }
        return { row, col };
      })
      .filter((n) => n);

    return neighbors as { row: number; col: number }[];
  }

  private getAdjacentBubblePositions(
    row: number,
    col: number,
    degrees = 1,
    includeBottom = false
  ) {
    const positions = [
      { row: row, col: col - degrees }, // left
      { row: row, col: col + degrees }, // right
      { row: row - degrees, col: col }, // top
      { row: row - degrees, col: col - degrees }, // top left
      { row: row - degrees, col: col + degrees } // top right
    ];

    if (includeBottom) {
      positions.push({ row: row + degrees, col: col }); // bottom
      positions.push({ row: row + degrees, col: col - degrees }); // bottom left
      positions.push({ row: row + degrees, col: col + degrees }); // bottom right
    }

    return positions;
  }

  private isRowStaggered(row: number) {
    if (row >= this.grid.length - 1) {
      // undefined row
      // invert the row above
      const rowList = this.grid[row - 1] as RowArray;
      return !rowList.isStaggered;
    }

    const rowList = this.grid[row] as RowArray;
    return rowList.isStaggered;
  }

  private removeEmptyRows() {
    // remove empty rows from grid
    const size = this.grid.length;
    for (let i = size - 1; i >= 0; --i) {
      const row = this.grid[i];
      if (row.find((n) => n)) {
        return;
      }
      this.grid.pop();
    }
  }

  public spawnNextWave(): void {
    this.descendBy(this.bubbleInterval);
    this.generateBubbleRow();
  }

  public descend(): void {
    this.descendBy(this.descentInterval);

    const dropLoop = this.scene.add.tileSprite(
      (this.gridX + this.gridRightX) / 2,
      this.effGridY + this.descentInterval * 0.5,
      this.gridWidth,
      this.descentInterval,
      TextureKeys.DropLoop
    );
    dropLoop.setDepth(1);
    this.effGridY += this.descentInterval;
  }
}
