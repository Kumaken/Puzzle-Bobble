import * as Phaser from 'phaser';
import FpsText from '../Object/FpsText';
import SceneKeys from '../Config/SceneKeys';

import '../Object/StaticBubblePool';
import '../Object/BubblePool';
import '../Object/Shooter';
import BubbleGrid from '../Object/BubbleGrid';
import BubbleSpawnModel from '../Object/BubbleSpawnModel';
import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';
import TextureKeys from '../Config/TextureKeys';
import BubbleLayoutData from '../Object/BubbleLayoutData';
import { IBubble } from '../Interfaces/IBubble';
import { IShooter } from '../Interfaces/IShooter';
import ShotGuide from '../Object/guides/ShotGuide';

enum GameState {
  Playing,
  GameOver,
  GameWin
}
const DPR = window.devicePixelRatio;

export default class LevelScene extends Phaser.Scene {
  private fpsText: FpsText;
  private grid?: BubbleGrid;
  private state;
  private bubbleSpawnModel!: IBubbleSpawnModel;
  private shooter?: IShooter;
  private inCollision: boolean;

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
    this.physics.world.setBoundsCollision(true, true, true, true);

    const staticBubblePool = this.add.staticBubblePool(TextureKeys.BubbleBlack);

    this.grid = new BubbleGrid(this, staticBubblePool);
    this.grid
      .setLayoutData(new BubbleLayoutData(this.bubbleSpawnModel))
      .generate();

    // Shooter:
    this.shooter = this.add.shooter(width * 0.5, height + 30 * DPR, '');
    this.shooter.setGuide(new ShotGuide(this));

    // Shooter Bubble Pool:
    const bubblePool = this.add.bubblePool(TextureKeys.BubbleBlack);
    this.shooter.setBubblePool(bubblePool);
    this.shooter.attachBubble();

    // Collider Setup:
    this.physics.add.collider(
      bubblePool,
      staticBubblePool,
      this.handleBubbleHitGrid,
      null,
      this
    );
    this.inCollision = false;

    // Starting grid position:
    this.grid.moveBy(400);

    const bubbleSub = this.grid
      .onBubbleWillBeDestroyed()
      .subscribe((bubble) => {
        this.handleBubbleWillBeDestroyed(bubble);
      });

    this.scene.run(SceneKeys.GameUI, {
      bubblesDestroyed: this.grid.onBubblesDestroyed(),
      bubblesAdded: this.grid.onBubblesAdded(),
      infectionsChanged: this.bubbleSpawnModel.onPopulationChanged()
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bubbleSub.unsubscribe();

      this.handleShutdown();
    });
  }

  update(t: number, dt: number): void {
    this.fpsText.update();

    if (this.state === GameState.GameOver || this.state === GameState.GameWin) {
      return;
    }
    this.bubbleSpawnModel.update(dt);
    this.shooter.update(dt);
  }

  private handleBubbleWillBeDestroyed(bubble: IBubble) {
    const x = bubble.x;
    const y = bubble.y;

    // explosion then go to gameover
    const particles = this.add.particles(TextureKeys.BubblePop);
    particles.setDepth(2000);
    particles
      .createEmitter({
        speed: { min: -200, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        tint: bubble.color,
        lifespan: 300
      })
      .explode(50, x, y);
  }

  private handleShutdown() {
    this.scene.stop(SceneKeys.GameUI);

    this.grid?.destroy();
  }

  // private delay(ms: number) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  private async processBubbleHitGrid(
    bubble: Phaser.GameObjects.GameObject,
    gridBubble: Phaser.GameObjects.GameObject
  ) {
    // only accept collision if distance is close enough
    // gives a better feel for tight shots
    const b = bubble as IBubble;
    b.stop();
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
    bubble: IBubble,
    gridBubble: Phaser.GameObjects.GameObject
  ) {
    const b = bubble as IBubble;
    const bx = b.x;

    if (!this.inCollision && bx !== 0) {
      // prevent multiple chain collision and collision when resetting ball on 0,0 position
      this.inCollision = true;
      console.log('collide');
      b.stop();
      const color = b.color;
      const by = b.y;
      const gb = gridBubble as IBubble;
      const gx = gb.x;
      const gy = gb.y;

      const vx = b.body.deltaX();
      const vy = b.body.deltaY();

      // determine direction from bubble to grid
      // then negate it to have opposite direction
      const directionToGrid = new Phaser.Math.Vector2(gx - bx, gy - by)
        .normalize()
        .negate();

      // get where the bubble would be at contact with grid
      const x = gx + directionToGrid.x * gb.width;
      const y = gy + directionToGrid.y * gb.width;
      console.log('bx,by:', bx, by);
      console.log('gx,gy:', gx, gy);
      console.log('final x,y:', x, y);
      this.shooter?.returnBubble(b);

      // this.descentController?.hold()

      //await this.descentController?.reversing()

      await this.grid?.attachBubble(x, y, color, gb, vx, vy);
      await this.shooter?.attachBubble();
      this.inCollision = false;
      console.log('Done handling collision');
    }
  }
}
