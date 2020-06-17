import * as Phaser from 'phaser';
import FpsText from '../Object/FpsText';
import SceneKeys from '../Config/SceneKeys';

import '../Object/StaticBubblePool';
import BubbleGrid from '../Object/BubbleGrid';
import BubbleSpawnModel from '../Object/BubbleSpawnModel';
import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';
import TextureKeys from '../Config/TextureKeys';
import BubbleLayoutData from '../Object/BubbleLayoutData';
import { IBubble } from '../Interfaces/IBubble';

enum GameState {
  Playing,
  GameOver,
  GameWin
}
export default class LevelScene extends Phaser.Scene {
  private fpsText: FpsText;
  private grid?: BubbleGrid;
  private state;
  private bubbleSpawnModel!: IBubbleSpawnModel;

  constructor() {
    super({ key: SceneKeys.GameUI });
  }

  init(): void {
    this.state = GameState.Playing;
    this.bubbleSpawnModel = new BubbleSpawnModel(100);
  }

  create(): void {
    this.fpsText = new FpsText(this);

    const width = this.scale.width;
    const height = this.scale.height;
    console.log('width, height:', width, height);
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, false, false);

    const staticBubblePool = this.add.staticBubblePool(TextureKeys.BubbleBlack);

    this.grid = new BubbleGrid(this, staticBubblePool);
    this.grid
      .setLayoutData(new BubbleLayoutData(this.bubbleSpawnModel))
      .generate();

    this.grid.moveBy(1000);
  }

  update(t: number, dt: number): void {
    this.fpsText.update();

    if (this.state === GameState.GameOver || this.state === GameState.GameWin) {
      return;
    }
    this.bubbleSpawnModel.update(dt);
  }

  private processBubbleHitGrid(
    bubble: Phaser.GameObjects.GameObject,
    gridBubble: Phaser.GameObjects.GameObject
  ) {
    // only accept collision if distance is close enough
    // gives a better feel for tight shots
    const b = bubble as IBubble;
    const gb = gridBubble as IBubble;

    const active = b.active && gb.active;

    if (!active) {
      return false;
    }

    const distanceSq = Phaser.Math.Distance.Squared(b.x, b.y, gb.x, gb.y);
    const minDistance = b.width * 0.9;
    const mdSq = minDistance * minDistance;

    return distanceSq <= mdSq;
  }

  private async handleBubbleHitGrid(
    bubble: Phaser.GameObjects.GameObject,
    gridBubble: Phaser.GameObjects.GameObject
  ) {
    const b = bubble as IBubble;
    const bx = b.x;
    const by = b.y;
    const color = b.color;

    const vx = b.body.deltaX();
    const vy = b.body.deltaY();

    const gb = gridBubble as IBubble;
    const gx = gb.x;
    const gy = gb.y;

    // determine direction from bubble to grid
    // then negate it to have opposite direction
    const directionToGrid = new Phaser.Math.Vector2(gx - bx, gy - by)
      .normalize()
      .negate();

    // get where the bubble would be at contact with grid
    const x = gx + directionToGrid.x * gb.width;
    const y = gy + directionToGrid.y * gb.width;

    await this.grid?.attachBubble(x, y, color, gb, vx, vy);
  }
}
