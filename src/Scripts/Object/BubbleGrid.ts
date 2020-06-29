import 'phaser';

import BubbleLayoutData from './BubbleLayoutData';

import { colorIsMatch } from '../Config/ColorConfig';
import { Subject, Observable } from 'rxjs';
import { IBubble } from '../Interfaces/IBubble';
import { IStaticBubblePool } from '../Interfaces/IStaticBubblePool';
import ColorConfig from '../Config/ColorConfig';
import TextureKeys from '../Config/TextureKeys';
import Shooter from './Shooter';
import AlignTool from '../Util/AlignTool';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../Util/Constant';

interface IGridPosition {
  row: number;
  col: number;
}

type IBubbleOrNone = IBubble | undefined;

class RowList extends Array<IBubbleOrNone> {
  isStaggered = false;
}

export default class BubbleGrid {
  private scene: Phaser.Scene;
  private pool: IStaticBubblePool;

  private layoutData?: BubbleLayoutData;

  private size: Phaser.Structs.Size;

  private grid: IBubbleOrNone[][] = [];
  private bubblesCount = 0;

  private bubblesDestroyedSubject = new Subject<number>();
  private bubbleWillBeDestroyed = new Subject<IBubble>();
  private orphanWillBeDestroyed = new Subject<IBubble>();
  private bubblesAddedSubject = new Subject<number>();
  private bubbleAttachedSubject = new Subject<IBubble>();

  private midPoint: number;
  private bubblesPerRow: number;
  public gridWidth: number;
  public gridHeight: number;
  public gridX: number;
  public effGridX: number;

  public gridRightX: number;
  public effGridRightX: number;
  public gridY: number;
  public effGridY: number;
  public sideGap = 3;

  public descentInterval: number;
  public borderWidth = 22;

  private bubbleLeftmostX: number;
  private bubbleRightmostX: number;

  /**
   * Gets total active bubbles in the game
   */
  get totalBubbles(): number {
    return this.bubblesCount;
  }

  /**
   * Gets the total height value of the grid
   */
  get height(): number {
    this.cleanUpEmptyRows();
    return this.grid.length * this.bubbleInterval;
  }

  /**
   * Gets y value of height interval at every bubble row
   */
  get bubbleInterval(): number {
    return this.size.height;
  }

  /**
   * Gets the height where the last row is (most bottom)
   */
  get bottom(): number {
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
    this.size = new Phaser.Structs.Size(sample.width, sample.height);
    this.pool.despawn(sample);

    this.midPoint = this.scene.scale.width * 0.5 + this.size.width * 0.2;
    console.log(
      'midpoint',
      this.midPoint,
      'vs.',
      AlignTool.getCenterHorizontal(this.scene) + this.size.width * 0.2
    );
    this.gridHeight = DEFAULT_HEIGHT;

    // Calculate how wide is the bubble grid:
    this.gridWidth = this.size.width * bubblesPerRow + this.size.width * 0.5;
    this.gridX =
      this.midPoint -
      this.bubblesPerRow * 0.5 * this.size.width -
      this.size.width * 0.5;
    this.gridY = 0;
    // spawn border:
    scene.add.tileSprite(
      this.gridX,
      AlignTool.getCenterVertical(this.scene),
      this.borderWidth,
      this.gridHeight,
      TextureKeys.LeftBorder
    );
    this.gridRightX = this.gridX + this.gridWidth;
    // this.gridRightX = this.gridX + this.gridWidth;
    scene.add.tileSprite(
      this.gridRightX,
      AlignTool.getCenterVertical(this.scene), // center point
      this.borderWidth,
      this.gridHeight,
      TextureKeys.RightBorder
    );
    const topBorderIMG = scene.textures
      .get(TextureKeys.TopBorder)
      .getSourceImage();
    const topBorder = scene.add.tileSprite(
      (this.gridX + this.gridRightX) / 2,
      this.gridY + topBorderIMG.height * 1.5,
      this.gridWidth,
      topBorderIMG.height * 3,
      TextureKeys.TopBorder
    );
    topBorder.setDepth(1);

    this.effGridY = topBorderIMG.height * 3;
    this.effGridX = this.gridX + this.borderWidth / 2 + this.sideGap;
    this.effGridRightX = this.gridRightX - this.borderWidth / 2 - this.sideGap;
    this.descentInterval =
      scene.textures.get(TextureKeys.DropLoop).getSourceImage().height * 3;

    this.bubbleLeftmostX = this.effGridX + this.size.width / 2;
    this.bubbleRightmostX = this.effGridRightX - this.size.width / 2;
    console.log('bubblesize', this.size);
    console.log('bubble', this.bubbleLeftmostX, this.bubbleRightmostX);
    console.log('effboundary', this.effGridX, this.effGridRightX);
    console.log('boundary', this.gridX, this.gridRightX);
  }

  destroy(): void {
    this.bubblesDestroyedSubject.complete();
    this.bubbleWillBeDestroyed.complete();
  }

  setLayoutData(layout: BubbleLayoutData): this {
    this.layoutData = layout;

    return this;
  }

  onBubblesDestroyed(): Observable<number> {
    return this.bubblesDestroyedSubject.asObservable();
  }

  onBubbleWillBeDestroyed(): Observable<IBubble> {
    return this.bubbleWillBeDestroyed.asObservable();
  }

  onOrphanWillBeDestroyed(): Observable<IBubble> {
    return this.orphanWillBeDestroyed.asObservable();
  }

  onBubblesAdded(): Observable<number> {
    return this.bubblesAddedSubject.asObservable();
  }

  onBubbleAttached(): Observable<IBubble> {
    return this.bubbleAttachedSubject.asObservable();
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
    const width = this.size.width;
    const radius = width * 0.5;

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
    console.log('sameROW?', 'dy:', Math.abs(dy), 'Radius', radius);
    if (sameRow) {
      ty = cellY;
      // adjust x to be next to
      tx = dx <= 0 ? tx - radius : tx + radius;
    }

    const { row, col } = this.findRowAndColumns(gridBubble);
    console.log('findRowAndColumns:', row, col);

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
    console.log('isLeft', tx, cellX);
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
    if (this.getAt(bRow, bCol)) {
      console.log(
        "bubble already existed at the position we're inserting in!",
        bRow,
        bCol
      );
      // if (!sameRow) {
      //   if (hx < cellX) {
      //     if (isStaggered) {
      //       if (bCol !== 1) {
      //         tx -= this.size.width;
      //         bCol -= 1;
      //       }
      //     } else {
      //       if (bCol !== 0) {
      //         tx -= this.size.width;
      //         bCol -= 1;
      //       }
      //     }
      //   } else {
      //     if (bCol < this.bubblesPerRow - 1) {
      //       tx += this.size.width;
      //       bCol += 1;
      //     }
      //   }
      // } else {
      // if previously same row -> go to next row:
      if (ty < cellY) {
        ty -= this.bubbleInterval;
        bRow = row - 1;
      } else {
        ty += this.bubbleInterval;
        bRow = row + 1;
      }
    }
    // if (tx > this.scale.width) tx = this.scale.width;
    if (tx < this.bubbleLeftmostX) {
      if (this.isRowStaggered(bRow))
        tx = this.bubbleLeftmostX + this.size.width * 0.5;
      else tx = this.bubbleLeftmostX;
    }

    if (tx > this.bubbleRightmostX) {
      if (this.isRowStaggered(bRow))
        tx = this.bubbleRightmostX - this.size.width * 0.5;
      else tx = this.bubbleRightmostX;
    }
    // if (ty > this.scale.height) ty = this.scale.height;
    console.log('after', x, y, tx, ty);
    const newBubble = this.pool.spawn(x, y, color);
    this.insertAt(bRow, bCol, newBubble);

    const matches = this.findMatchesAt(bRow, bCol, color as number);
    // minimum 3 matches required
    if (matches.length < 3) {
      this.bubblesCount += 1;
      this.bubblesAddedSubject.next(1);
      this.bubbleAttachedSubject.next(newBubble);
      await this.animateAttachBounceAt(bRow, bCol, tx, ty, newBubble);
      console.table(this.grid);
      return;
    }

    // remove them from grid immediately but not visually...
    // remove visually after animation below
    // we want to remove from grid immediately so that other
    // processes that add new rows can run normally
    const matchedBubbles = this.removeFromGrid(matches);

    const orphanPositions = this.findOrphanedBubbles();
    const orphans = this.removeFromGrid(orphanPositions).map((bubble) => {
      bubble.setActive(false);
      this.scene.physics.world.remove(bubble.body);
      return bubble;
    });

    this.cleanUpEmptyRows();

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

    // remove matched bubbles
    matchedBubbles.forEach((bubble) => {
      this.bubbleWillBeDestroyed.next(bubble);
      this.pool.despawn(bubble);
    });

    const destroyedCount = matches.length + orphans.length;
    this.bubblesDestroyedSubject.next(destroyedCount);
    this.bubblesCount -= destroyedCount;

    if (orphans.length > 0) {
      await this.animateOrphans(orphans);
    }

    console.table(this.grid);
    console.log('DONE ATTACH BUBBLE -------------');
    Shooter.isShooting = false;
  }

  /**
   * Initial generation of bubbles
   * @param rows how many rows to generate initially to hold the bubbles
   */
  generate(rows = 6): this {
    if (!this.layoutData) {
      return this;
    }
    for (let i = 0; i < rows; ++i) {
      this.spawnRow();
    }

    return this;
  }

  moveBy(dy: number): this {
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
   * Spawns bubble on one row. Contains algorithm on whether to place bubble on another row or this row.
   * It spawns a row of bubble to the top
   * Returns row number
   */
  spawnRow(): number {
    // if layout data is unavailable, terminate:
    if (!this.layoutData) {
      return -1;
    }

    let currRowIsStaggered;
    if (this.grid.length <= 1) {
      if (this.grid.length == 0) currRowIsStaggered = false;
      else currRowIsStaggered = true;
    } else currRowIsStaggered = !this.isRowStaggered(2);
    const row = this.layoutData.getNextRow(currRowIsStaggered);
    const count = row.length;

    if (count <= 0) {
      return 0;
    }

    this.addRowToFront(row, currRowIsStaggered);

    this.bubblesCount += count;
    this.bubblesAddedSubject.next(count);

    return row.length;
  }

  spawnRowUpperBound(): number {
    // if layout data is unavailable, terminate:
    if (!this.layoutData) {
      return -1;
    }

    const currRowIsStaggered = false;
    const row = this.layoutData.getNextRow(currRowIsStaggered);
    const count = row.length;

    if (count <= 0) {
      return 0;
    }

    this.addRowToFront(row, currRowIsStaggered);

    return row.length;
  }

  private addRowToFront(row: ColorConfig[], isStaggered: boolean) {
    const width = this.size.width;
    const radius = width * 0.5;
    const verticalInterval = this.bubbleInterval;

    const count = row.length;

    const gridRow = new RowList();
    this.grid.unshift(gridRow);

    const halfCount = count * 0.5;
    let x = this.midPoint - halfCount * width + radius * 0.5;
    let y = 0;

    gridRow.isStaggered = isStaggered;
    if (this.grid.length > 1) {
      const rowList = this.grid[1] as RowList;
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
        // console.lo(colorCode);
      }
    });

    // if (gridRow.isStaggered) {
    //   // pad end with space for offset
    //   // gridRow.pop();
    //   gridRow.push(undefined);
    // }
  }

  private removeFromGrid(matches: IGridPosition[]) {
    const bubbles: IBubble[] = [];
    const size = matches.length;
    for (let i = 0; i < size; ++i) {
      const { row, col } = matches[i];
      const bubble = this.getAt(row, col);

      if (!bubble) {
        // should never be the case..
        console.warn(`detroyMatches: match not found...`);
        continue;
      }

      this.grid[row][col] = undefined;
      bubbles.push(bubble);
    }

    return bubbles;
  }

  private async animateOrphans(orphans: IBubble[]) {
    // move down and fade out
    const timeline = this.scene.tweens.timeline();
    const bottom = this.scene.scale.height * 0.9;

    const tasks = orphans.map((orphan) => {
      const y = orphan.y;
      const dy = bottom - y;
      const duration = dy * 0.75;

      return new Promise((resolve) => {
        timeline.add({
          targets: orphan,
          y: y + dy,
          offset: 0,
          duration,
          onComplete: function () {
            this.bubbleWillBeDestroyed.next(orphan);
            this.orphanWillBeDestroyed.next(orphan);
            this.pool.despawn(orphan);

            resolve();
          },
          onCompleteScope: this
        });
      });
    });

    timeline.play();

    await Promise.all(tasks);
  }

  private async animateAttachBounceAt(
    row: number,
    col: number,
    tx: number,
    ty: number,
    newBubble: IBubble
  ) {
    // https://github.com/photonstorm/phaser/blob/v3.22.0/src/math/easing/EaseMap.js

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
        Shooter.isShooting = false;
        console.log('finished animation');
      }
    });

    await timeline.play();

    await this.jiggleNeighbors(row, col);
    console.log('finished animate attach');
  }

  /**
   * Find the row of a bubble
   */
  private findRowAndColumns(bubble: IBubble) {
    // HEURISTIC: search from the bottom of the grid (more likely to find match early on)
    console.log(bubble);
    const size = this.grid.length;
    for (let i = size - 1; i >= 0; --i) {
      const row = this.grid[i];
      const colIdx = row.findIndex((b) => b === bubble);
      if (colIdx < 0) {
        // not found in this row
        continue;
      }

      return {
        row: i,
        col: colIdx
      };
    }

    return {
      row: -1,
      col: -1
    };
  }

  private insertAt(row: number, col: number, bubble: IBubble) {
    if (row >= this.grid.length) {
      const count = row - (this.grid.length - 1);
      for (let i = 0; i < count; ++i) {
        const rowList = new RowList();
        const prevRow = this.grid[row + i - 1] as RowList;
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
    console.log('inserting:', rowList, 'at', row, col);
  }

  private getAt(row: number, col: number) {
    if (row < 0) {
      return null;
    }

    if (row > this.grid.length - 1) {
      return null;
    }

    const rowList = this.grid[row];
    return rowList[col];
  }

  private findOrphanedBubbles() {
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

    // any bubbles that are NOT in the connected set are orphaned
    // ignore the root row at index 0; they can never be "orphaned"
    const orphans: IGridPosition[] = [];
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

        orphans.push({
          row,
          col
        });
      }
    }

    return orphans;
  }

  private findMatchesAt(
    row: number,
    col: number,
    color: number,
    found: Set<IBubble> = new Set()
  ) {
    // breadth-first search method
    const isStaggered = this.isRowStaggered(row);
    const adjacentMatches: IGridPosition[] = [];

    // ignore bubbles on first row (placeholder hidden row)
    if (row - 1 !== 0) {
      // top left
      if (isStaggered) {
        const tl = this.getAt(row - 1, col - 1);
        if (tl && colorIsMatch(tl.color, color) && !found.has(tl)) {
          adjacentMatches.push({
            row: row - 1,
            col: col - 1
          });
          found.add(tl);
        }
      }

      // top
      const t = this.getAt(row - 1, col);
      if (t && colorIsMatch(t.color, color) && !found.has(t)) {
        adjacentMatches.push({
          row: row - 1,
          col
        });
        found.add(t);
      }

      // top right
      if (!isStaggered) {
        const tr = this.getAt(row - 1, col + 1);
        if (tr && colorIsMatch(tr.color, color) && !found.has(tr)) {
          adjacentMatches.push({
            row: row - 1,
            col: col + 1
          });
          found.add(tr);
        }
      }
    }
    // right
    const r = this.getAt(row, col + 1);
    if (r && colorIsMatch(r.color, color) && !found.has(r)) {
      adjacentMatches.push({
        row,
        col: col + 1
      });
      found.add(r);
    }

    // bottom right
    if (!isStaggered) {
      const br = this.getAt(row + 1, col + 1);
      if (br && colorIsMatch(br.color, color) && !found.has(br)) {
        adjacentMatches.push({
          row: row + 1,
          col: col + 1
        });
        found.add(br);
      }
    }

    // bottom
    const b = this.getAt(row + 1, col);
    if (b && colorIsMatch(b.color, color) && !found.has(b)) {
      adjacentMatches.push({
        row: row + 1,
        col
      });
      found.add(b);
    }

    // bottom left
    if (isStaggered) {
      const bl = this.getAt(row + 1, col - 1);
      if (bl && colorIsMatch(bl.color, color) && !found.has(bl)) {
        adjacentMatches.push({
          row: row + 1,
          col: col - 1
        });
        found.add(bl);
      }
    }

    // left
    const l = this.getAt(row, col - 1);
    if (l && colorIsMatch(l.color, color) && !found.has(l)) {
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
      return !this.getAt(row, col);
    });

    if (missing) {
      console.dir(missing);
    }

    return adjacentMatches;
  }

  private async jiggleNeighbors(sourceRow: number, sourceCol: number) {
    const sourceBubble = this.getAt(sourceRow, sourceCol);
    const firstNeightbors = this.getNeighbors(sourceRow, sourceCol);

    const secondTop = sourceRow - 1;

    const secondNeighbors = firstNeightbors.find(({ row }) => row === secondTop)
      ? this.getNeighbors(secondTop, sourceCol)
      : [];

    const degrees = [firstNeightbors, secondNeighbors];

    const size = degrees.length;
    for (let i = 0; i < size; ++i) {
      const deg = degrees[i];
      for (let j = 0; j < deg.length; ++j) {
        const { row, col } = deg[j];
        const bubble = this.getAt(row, col);
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
          ease: 'Back.easeOut',
          onComplete: () => {
            console.log('finished animation jiggle');
          }
        });

        await timeline.play();
        console.log('jiggle finished');
      }
    }
  }

  private getNeighbors(row: number, col: number, includeBottom = false) {
    const positions = this.getNeighborPositions(row, col, 1, includeBottom);
    const neighbors = positions
      .map(({ row, col }) => {
        const n = this.getAt(row, col);
        if (!n) {
          return undefined;
        }
        return { row, col };
      })
      .filter((n) => n);

    return neighbors as { row: number; col: number }[];
  }

  private getNeighborPositions(
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
      // if asking about a row that has not been created yet
      // check row above and invert
      const rowList = this.grid[row - 1] as RowList;
      return !rowList.isStaggered;
    }

    const rowList = this.grid[row] as RowList;
    return rowList.isStaggered;
  }

  private cleanUpEmptyRows() {
    const size = this.grid.length;
    for (let i = size - 1; i >= 0; --i) {
      const row = this.grid[i];
      if (row.find((n) => n)) {
        return;
      }

      this.grid.pop();
    }
  }

  public spawnNextWave() {
    this.moveBy(this.bubbleInterval);
    this.spawnRow();
  }

  public descend(): void {
    this.moveBy(this.descentInterval);

    this.scene.add.tileSprite(
      (this.gridX + this.gridRightX) / 2,
      this.effGridY + this.descentInterval * 0.5,
      this.gridWidth,
      this.descentInterval,
      TextureKeys.DropLoop
    );
    this.effGridY += this.descentInterval;
  }
}
