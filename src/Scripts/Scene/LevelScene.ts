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
import ShotGuide from '../Object/ShotGuide';
import GameUI from './GameUI';
import DescentController from '../Object/DescentController';
import SFXController from '../Object/SFXController';
import Shooter from '../Object/Shooter';
import AlignTool from '../Util/AlignTool';
import PreloadScene from './PreloadScene';
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
  private shooter?: IShooter;
  private gameUI: GameUI;
  private descentController?: DescentController;
  private sfxController?: SFXController;
  private gameSettings;
  // background
  private baseBG;
  private layer1;
  private layer2;
  private layer3;
  private layer4;
  private layer5;
  private layer6;
  private layer7;

  constructor() {
    super({ key: SceneKeys.Game });
  }

  init(): void {
    this.state = GameState.Playing;
    this.bubbleSpawnModel = new BubbleSpawnModel();
    this.sfxController = new SFXController(this.sound);
  }

  create(): void {
    this.fpsText = new FpsText(this);

    // Setup background:
    this.setupBackground();

    const staticBubblePool = this.add.staticBubblePool(TextureKeys.BubbleBlack);

    // GAME SETTINGS
    this.gameSettings = {
      bubblesPerRow: 10,
      initialBubbleRows: 6,
      maxBubbleCount: 150,
      initialDescent: 0,
      rowHeight: undefined,
      gap: 85 * PreloadScene.screenScale.scaleHeight
    };

    // Setup Bubble Grid
    this.grid = new BubbleGrid(
      this,
      staticBubblePool,
      this.gameSettings.bubblesPerRow
    );
    this.grid
      .setBubbleLayoutData(
        new BubbleLayoutData(
          this.bubbleSpawnModel,
          this.gameSettings.bubblesPerRow
        )
      )
      .generateInitialBubbles();

    // GAME SETTINGS
    this.gameSettings.initialDescent = this.grid.effGridY;
    this.gameSettings.rowHeight = this.grid.bubbleInterval;

    // Setup world boundary
    this.physics.world.setBounds(
      this.grid.effGridX,
      this.grid.effGridY,
      this.grid.gridWidth,
      this.grid.gridHeight
    );
    this.physics.world.setBoundsCollision(true, true, false, true);

    // Shooter Platform:
    const shooterFoundationIMG = this.textures
      .get(TextureKeys.ShooterFoundation)
      .getSourceImage();
    const shooterFoundationHeight =
      shooterFoundationIMG.height * PreloadScene.screenScale.scaleHeight;
    this.add
      .sprite(
        PreloadScene.screenWidth * 0.5,
        PreloadScene.screenHeight - shooterFoundationHeight * 0.5,
        TextureKeys.ShooterFoundation
      )
      .setScale(
        PreloadScene.screenScale.scaleWidth,
        PreloadScene.screenScale.scaleHeight
      );

    // Next bubble sign:
    const nextBubbleSignIMG = this.textures
      .get(TextureKeys.PlatformSign)
      .getSourceImage();
    const nextSignHeight =
      nextBubbleSignIMG.height * PreloadScene.screenScale.scaleHeight;
    this.add
      .sprite(
        PreloadScene.screenWidth * 0.5 + 200,
        PreloadScene.screenHeight - nextSignHeight * 0.5 - 30,
        TextureKeys.PlatformSign
      )
      .setScale(
        PreloadScene.screenScale.scaleWidth,
        PreloadScene.screenScale.scaleHeight
      );

    // Next bubble Platform:
    const bubblePlatformIMG = this.textures
      .get(TextureKeys.BubblePlatform)
      .getSourceImage();
    const bubblePlatformHeight =
      bubblePlatformIMG.height * PreloadScene.screenScale.scaleHeight;
    this.add
      .sprite(
        PreloadScene.screenWidth * 0.5 + 200,
        PreloadScene.screenHeight - bubblePlatformHeight * 0.5,
        TextureKeys.BubblePlatform
      )
      .setScale(
        PreloadScene.screenScale.scaleWidth,
        PreloadScene.screenScale.scaleHeight
      );

    // Shooter:
    const shooterIMG = this.textures.get(TextureKeys.Shooter).getSourceImage();
    const shooterHeight =
      shooterIMG.height * PreloadScene.screenScale.scaleHeight;
    this.shooter = this.add
      .shooter(
        PreloadScene.screenWidth * 0.5 - 20,
        PreloadScene.screenHeight - shooterHeight * 0.5 - 30,
        TextureKeys.Shooter
      )
      .setScale(
        PreloadScene.screenScale.scaleWidth,
        PreloadScene.screenScale.scaleHeight
      );
    this.shooter.setShooterGuide(
      new ShotGuide(this, this.grid, staticBubblePool, 200)
    );

    // Shooter Bubble Pool:
    const bubblePool = this.add.bubblePool(TextureKeys.BubbleBlack);
    this.shooter.setBubblePool(bubblePool);
    this.shooter.prepareNextBubble();
    this.shooter.attachNextBubble();
    this.shooter.prepareNextBubble();

    // Collider Setup:
    this.physics.add.collider(
      bubblePool,
      staticBubblePool,
      this.handleBubbleHitGrid,
      null,
      this
    );

    // Starting grid position:
    this.descentController = new DescentController(
      this,
      this.grid,
      this.bubbleSpawnModel,
      this.sfxController
    );

    this.descentController.setInitialDescent(
      this.gameSettings.initialDescent +
        this.gameSettings.initialBubbleRows * this.gameSettings.rowHeight -
        this.gameSettings.gap
    );

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
      bubblesDestroyed: this.grid.onBubblesDestroyed(),
      countdownChanged: this.descentController?.onCountdownChanged()
    });
    this.gameUI = this.scene.get(SceneKeys.GameUI) as GameUI;
    this.gameUI.setSFXController(this.sfxController);

    this.scene.bringToTop(SceneKeys.GameUI);

    // Setup Audio:
    this.sfxController?.handleShootBubble(this.shooter.onShoot());
    this.sfxController?.handleBubbleAttached(this.grid.onBubbleAttached());
    this.sfxController?.handleClearMatches(this.grid.onBubblesDestroyed());
    this.sfxController?.handleClearDangling(
      this.grid.onDanglingWillBeDestroyed()
    );
    this.sfxController.playBGMMusic();
  }

  update(t: number, dt: number): void {
    this.fpsText.update();
    this.updateBackground();

    if (this.state === GameState.GameOver || this.state === GameState.GameWin) {
      return;
    }
    this.descentController.update(dt);
    this.shooter.update(dt);

    // debug coords:
    // this.gameUI.updateMouseCoordsText(this);

    const dcy = this.grid?.gridBottom;

    if (dcy > this.shooter.y - this.shooter.shooterHeight / 2) {
      // game over
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
    this.grid?.destroy();
    this.descentController.destroy();
  }

  public descendWorldBounds(): void {
    this.physics.world.setBounds(
      this.grid.effGridX,
      this.grid.effGridY,
      this.grid.gridWidth,
      this.grid.gridHeight
    );
  }

  private async handleBubbleHitGrid(
    bubble: IBubble,
    gridBubble: Phaser.GameObjects.GameObject
  ) {
    if (Shooter.isShooting) {
      const b = bubble as IBubble;
      const bx = b.x;
      if (bx == 0) return;

      // prevent multiple chain collision and collision when resetting Bubble on 0,0 position
      b.stopBubble();
      const color = b.color;
      const by = b.y;
      const gb = gridBubble as IBubble;
      const gx = gb.x;
      const gy = gb.y;

      const vx = b.body.deltaX();
      const vy = b.body.deltaY();

      // determine direction from bubble to grid, then negate it to have opposite direction
      const directionToGrid = new Phaser.Math.Vector2(gx - bx, gy - by)
        .normalize()
        .negate();

      // get where the bubble would collided with the bubbles on the grid
      const x = gx + directionToGrid.x * gb.width;
      const y = gy + directionToGrid.y * gb.width;

      this.shooter?.recycleBubble(b); // despawn the bubble that was launched
      await this.grid?.attachBubble(x, y, color, gb, vx, vy); // determine which bubble will be loaded now
      await this.shooter?.attachNextBubble(); // attach currently next bubble to the shooter
      await this.shooter?.prepareNextBubble(); // determine which bubble will be loaded next
    }
  }

  private handleGameOver() {
    this.scene.pause(SceneKeys.GameUI);
    this.sfxController?.stopAllAudio();
    this.scene.run(SceneKeys.GameOver, { score: this.gameUI._score });
  }

  private setupBackground() {
    const raw_bg_img = this.textures
      .get(TextureKeys.BaseBackground)
      .getSourceImage();
    this.baseBG = this.add.tileSprite(
      AlignTool.getCenterHorizontal(this),
      AlignTool.getCenterVertical(this),
      raw_bg_img.width * PreloadScene.screenScale.scaleWidth,
      raw_bg_img.height * PreloadScene.screenScale.scaleHeight,
      TextureKeys.BaseBackground
    );

    for (let i = 1; i <= 7; i++) {
      const raw_img = this.textures
        .get(TextureKeys[`Layer${i}`])
        .getSourceImage();
      this[`layer${i}`] = this.add.tileSprite(
        AlignTool.getCenterHorizontal(this),
        AlignTool.getCenterVertical(this),
        raw_img.width * PreloadScene.screenScale.scaleWidth,
        raw_img.height * PreloadScene.screenScale.scaleHeight,
        TextureKeys[`Layer${i}`]
      );
    }
  }

  private updateBackground() {
    this.baseBG.tilePositionY -= 1;
    this.layer1.tilePositionY -= 0.2;
    this.layer1.tilePositionX += 0.5;
    this.layer2.tilePositionY -= 0.1;
    this.layer3.tilePositionY -= 0.1;
    this.layer3.tilePositionX -= 0.2;
    this.layer4.tilePositionY -= 0.25;
    this.layer5.tilePositionY -= 0.15;
    this.layer6.tilePositionY -= 0.4;
    this.layer6.tilePositionX -= 0.5;
    this.layer7.tilePositionY -= 0.2;
    this.layer7.tilePositionX -= 0.3;
  }
}
