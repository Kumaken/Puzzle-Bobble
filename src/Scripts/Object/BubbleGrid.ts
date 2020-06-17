import 'phaser';

import BubbleLayoutData, { Red, Gre, Blu, Yel } from './BubbleLayoutData';

import BubbleColor, { colorIsMatch } from '../Config/BubbleColorConfig';
import { Subject } from 'rxjs';
import { IBubble } from '../Interfaces/IBubble';
import { IStaticBubblePool } from '../Interfaces/IStaticBubblePool';

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

  get totalBubbles() {
    return this.bubblesCount;
  }

  get height() {
    this.cleanUpEmptyRows();
    return this.grid.length * this.bubbleInterval;
  }

  get bubbleInterval() {
    return this.size.height * 0.8;
  }

  get bottom() {
    if (this.grid.length <= 0) {
      return 0;
    }

    const idx = this.grid.length - 1;
    const bubble = this.grid[idx].find((n) => n);
    if (!bubble) {
      return 0;
    }

    return bubble.y + bubble.radius;
  }

  constructor(scene: Phaser.Scene, pool: IStaticBubblePool) {
    this.scene = scene;
    this.pool = pool;

    const sample = this.pool.spawn(0, 0);
    this.size = new Phaser.Structs.Size(sample.width, sample.height);
    this.pool.despawn(sample);
  }

  destroy() {
    this.bubblesDestroyedSubject.complete();
    this.bubbleWillBeDestroyed.complete();
  }

  setLayoutData(layout: BubbleLayoutData) {
    this.layoutData = layout;

    return this;
  }

  onBubblesDestroyed() {
    return this.bubblesDestroyedSubject.asObservable();
  }

  onBubbleWillBeDestroyed() {
    return this.bubbleWillBeDestroyed.asObservable();
  }

  onOrphanWillBeDestroyed() {
    return this.orphanWillBeDestroyed.asObservable();
  }

  onBubblesAdded() {
    return this.bubblesAddedSubject.asObservable();
  }

  onBubbleAttached() {
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
  async attachBubble(
    x: number,
    y: number,
    color: BubbleColor,
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
    if (sameRow) {
      ty = cellY;
      // adjust x to be next to
      tx = dx <= 0 ? tx - radius : tx + radius;
    }

    const newBubble = this.pool.spawn(x, y).setColor(color);

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

    let bCol = -1;

    if (sameRow) {
      bCol = tx < cellX ? col - 1 : col + 1;
    } else {
      const isStaggered = this.isRowStaggered(bRow);
      if (isStaggered) {
        bCol = tx < cellX ? col : col + 1;
      } else {
        bCol = tx < cellX ? col - 1 : col;
      }
    }

    this.insertAt(bRow, bCol, newBubble);

    const matches = this.findMatchesAt(bRow, bCol, color);
    // minimum 3 matches required
    if (matches.length < 3) {
      this.bubblesCount += 1;
      this.bubblesAddedSubject.next(1);
      this.bubbleAttachedSubject.next(newBubble);
      this.animateAttachBounceAt(bRow, bCol, tx, ty, newBubble);
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
  }

  generate(rows = 6) {
    if (!this.layoutData) {
      return this;
    }

    for (let i = 0; i < rows; ++i) {
      this.spawnRow();
    }

    return this;
  }

  moveBy(dy: number) {
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

  spawnRow() {
    if (!this.layoutData) {
      return -1;
    }

    const row = this.layoutData.getNextRow();
    const count = row.length;

    if (count <= 0) {
      return 0;
    }

    this.addRowToFront(row);

    this.bubblesCount += count;
    this.bubblesAddedSubject.next(count);

    return row.length;
  }

  private addRowToFront(row: string[]) {
    const middle = this.scene.scale.width * 0.5;
    const width = this.size.width;
    const radius = width * 0.5;
    const verticalInterval = this.bubbleInterval;

    const count = row.length;

    const gridRow = new RowList();
    this.grid.unshift(gridRow);

    const halfCount = count * 0.5;
    let x = middle - halfCount * width + radius * 0.5;
    let y = 0;

    if (this.grid.length <= 1) {
      gridRow.isStaggered = true;
    } else {
      const rowList = this.grid[1] as RowList;
      gridRow.isStaggered = !rowList.isStaggered;
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
      const b = this.pool.spawn(x, y);
      gridRow.push(b);

      switch (colorCode) {
        default:
        case undefined:
          break;

        case Red:
          b!.setColor(BubbleColor.Red);
          break;

        case Blu:
          b!.setColor(BubbleColor.Blue);
          break;

        case Gre:
          b!.setColor(BubbleColor.Green);
          break;

        case Yel:
          b!.setColor(BubbleColor.Yellow);
          break;
      }

      x += width;
    });

    if (!gridRow.isStaggered) {
      // pad end with space for offset
      gridRow.push(undefined);
    }
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

  private animateAttachBounceAt(
    row: number,
    col: number,
    tx: number,
    ty: number,
    newBubble: IBubble
  ) {
    // https://github.com/photonstorm/phaser/blob/v3.22.0/src/math/easing/EaseMap.js
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

    timeline.play();

    this.jiggleNeighbors(row, col);
  }

  private findRowAndColumns(bubble: IBubble) {
    // search from the bottom
    const size = this.grid.length;
    for (let i = size - 1; i >= 0; --i) {
      const row = this.grid[i];
      const colIdx = row.findIndex((b) => b === bubble);
      if (colIdx < 0) {
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
      this.findMatchesAt(row, col, BubbleColor.Any, connected);
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
    color: BubbleColor,
    found: Set<IBubble> = new Set()
  ) {
    // breadth-first search method
    const isStaggered = this.isRowStaggered(row);
    const adjacentMatches: IGridPosition[] = [];

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

  private jiggleNeighbors(sourceRow: number, sourceCol: number) {
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
          ease: 'Back.easeOut'
        });

        timeline.play();
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
}
