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
import GameUI from './GameUI';
import DescentController from '../Object/DescentController';

enum GameState {
  Playing,
  GameOver,
  GameWin
}

// GAME SETTINGS
const gameSettings = {
  bubblesPerRow: 10,
  initialBubbleHeight: 360
};
const DPR = window.devicePixelRatio;

export default class LevelScene extends Phaser.Scene {
  private fpsText: FpsText;
  private grid?: BubbleGrid;
  private state;
  private bubbleSpawnModel!: IBubbleSpawnModel;
  private shooter?: IShooter;
  private inCollision: boolean;
  private gameUI: GameUI;
  private descentController?: DescentController;

  constructor() {
    super({ key: SceneKeys.Game });
  }

  init(): void {
    this.state = GameState.Playing;
    this.bubbleSpawnModel = new BubbleSpawnModel(100);
  }

  create(): void {
    this.fpsText = new FpsText(this);

    const width = this.scale.width;
    const height = this.scale.height;

    const staticBubblePool = this.add.staticBubblePool(TextureKeys.BubbleBlack);

    // Setup Bubble Grid
    this.grid = new BubbleGrid(
      this,
      staticBubblePool,
      gameSettings.bubblesPerRow
    );
    this.grid
      .setLayoutData(
        new BubbleLayoutData(this.bubbleSpawnModel, gameSettings.bubblesPerRow)
      )
      .generate();

    // Setup world boundary
    this.physics.world.setBounds(
      this.grid.gridX,
      this.grid.effGridY,
      this.grid.gridWidth,
      this.grid.gridHeight
    );
    this.physics.world.setBoundsCollision(true, true, true, true);

    // Shooter Platform:
    const shooterFoundationIMG = this.textures
      .get(TextureKeys.ShooterFoundation)
      .getSourceImage();
    this.add.sprite(
      width * 0.5,
      height - shooterFoundationIMG.height / 2,
      TextureKeys.ShooterFoundation
    );

    // Next bubble sign:
    const nextBubbleSignIMG = this.textures
      .get(TextureKeys.PlatformSign)
      .getSourceImage();
    this.add.sprite(
      width * 0.5 + 200,
      height - nextBubbleSignIMG.height / 2 - 30,
      TextureKeys.PlatformSign
    );

    // Next bubble Platform:
    const bubblePlatformIMG = this.textures
      .get(TextureKeys.BubblePlatform)
      .getSourceImage();
    this.add.sprite(
      width * 0.5 + 200,
      height - bubblePlatformIMG.height / 2,
      TextureKeys.BubblePlatform
    );

    // Shooter:
    const shooterIMG = this.textures.get(TextureKeys.Shooter).getSourceImage();
    this.shooter = this.add.shooter(
      width * 0.5 - 20,
      height - shooterIMG.height / 2 - 30,
      TextureKeys.Shooter
    );
    this.shooter.setGuide(new ShotGuide(this));

    // Shooter Bubble Pool:
    const bubblePool = this.add.bubblePool(TextureKeys.BubbleBlack);
    this.shooter.setBubblePool(bubblePool);
    this.shooter.attachBubble();
    this.shooter.attachNextBubble();
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
    this.descentController = new DescentController(
      this,
      this.grid,
      this.bubbleSpawnModel,
      this.grid.bubbleInterval
    );
    this.descentController.setStartingDescent(gameSettings.initialBubbleHeight);

    const bubbleSub = this.grid
      .onBubbleWillBeDestroyed()
      .subscribe((bubble) => {
        this.handleBubbleWillBeDestroyed(bubble);
      });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bubbleSub.unsubscribe();

      this.handleShutdown();
    });

    // Activate Game UI:
    this.scene.run(SceneKeys.GameUI, {
      ballsDestroyed: this.grid.onBubblesDestroyed(),
      ballsAdded: this.grid.onBubblesAdded()
      // infectionsChanged: this.bubbleSpawnModel.onPopulationChanged()
    });
    this.gameUI = this.scene.get(SceneKeys.GameUI) as GameUI;

    this.scene.bringToTop(SceneKeys.GameUI);
  }

  update(t: number, dt: number): void {
    this.fpsText.update();

    if (this.state === GameState.GameOver || this.state === GameState.GameWin) {
      return;
    }
    this.bubbleSpawnModel.update(dt);
    this.descentController.update(dt);
    this.shooter.update(dt);

    // debug coords:
    this.gameUI.updateMouseCoordsText(this);

    const dcy = this.grid?.bottom;

    if (dcy > this.shooter.y - this.shooter.shooterHeight / 2) {
      // game over
      console.log('gameover');
      this.state = GameState.GameOver;
      this.handleGameOver();
    }
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
    this.descentController?.destroy();
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
    if (!this.inCollision) {
      const b = bubble as IBubble;
      const bx = b.x;
      if (bx == 0) return;

      // prevent multiple chain collision and collision when resetting ball on 0,0 position
      this.inCollision = true;
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
      // handle if x or y is goes out of world bounds:

      this.shooter?.returnBubble(b);

      // this.descentController?.hold()

      //await this.descentController?.reversing()

      await this.grid?.attachBubble(x, y, color, gb, vx, vy);

      await this.shooter?.attachNextBubble();
      await this.shooter?.attachBubble();
      this.inCollision = false;
    }
  }

  private handleGameOver() {
    this.scene.pause(SceneKeys.GameUI);
    this.scene.run(SceneKeys.GameOver);
  }
}
