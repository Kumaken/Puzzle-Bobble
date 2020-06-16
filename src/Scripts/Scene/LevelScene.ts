// import * as Phaser from 'phaser';
// import FpsText from '../Object/FpsText';
// import BubbleGrid from '../Object/BubbleGrid';
// import '../Object/StaticBubblePool';
// import { IBubbleSpawnModel } from '../Interfaces/IBubbleSpawnModel';
// import BubbleSpawnModel from '../Object/BubbleSpawnModel';
// import TextureKeys from '../Config/TextureKeys';
// import SceneKeys from '../Config/SceneKeys';
// import BubbleLayoutData from '../Object/BubbleLayoutData';
// import { IBubble } from '../Interfaces/IBubble';
// enum GameState {
//   Playing,
//   GameOver,
//   GameWin
// }
// const DPR = window.devicePixelRatio;
// export default class LevelScene extends Phaser.Scene {
//   private fpsText: FpsText;
//   private grid?: BubbleGrid;

//   private bubbleSpawnModel!: IBubbleSpawnModel;

//   constructor() {
//     super({ key: SceneKeys.GameUI });
//   }

//   private state = GameState.Playing;

//   init() {
//     this.state = GameState.Playing;
//     this.bubbleSpawnModel = new BubbleSpawnModel(100);
//   }
//   preload(): void {}

//   create(): void {
//     const ballPool = this.add.bubblePool(TextureKeys.Virus);
//     ballPool.spawn(0, 0);
//     const width = this.scale.width;
//     const height = this.scale.height;

//     this.add
//       .image(width * 0.5, height * 0.5, TextureKeys.Background)
//       .setScale(DPR)
//       .setTint(0x353535ff);

//     this.physics.world.setBounds(0, 0, width, height);
//     this.physics.world.setBoundsCollision(true, true, false, false);

//     const bubblePool = this.add.bubblePool(TextureKeys.Virus);

//     const staticBubblePool = this.add.staticBubblePool(TextureKeys.Virus);

//     this.grid = new BubbleGrid(this, staticBubblePool);
//     this.grid
//       .setLayoutData(new BubbleLayoutData(this.bubbleSpawnModel))
//       .generate();

//     this.physics.add.collider(
//       bubblePool,
//       staticBubblePool,
//       this.handleBubbleHitGrid,
//       this.processBubbleHitGrid,
//       this
//     );

//     const winSub = this.bubbleSpawnModel
//       .onPopulationChanged()
//       .subscribe((count) => {
//         if (count > 0) {
//           return;
//         }

//         this.handleGameWin();
//       });

//     const bubbleSub = this.grid
//       .onBubbleWillBeDestroyed()
//       .subscribe((bubble) => {
//         this.handleBubbleWillBeDestroyed(bubble);
//       });

//     this.scene.run(SceneKeys.GameUI, {
//       bubblesDestroyed: this.grid.onBubblesDestroyed(),
//       bubblesAdded: this.grid.onBubblesAdded(),
//       infectionsChanged: this.bubbleSpawnModel.onPopulationChanged()
//     });
//     this.scene.bringToTop(SceneKeys.GameUI);

//     this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
//       winSub.unsubscribe();
//       bubbleSub.unsubscribe();

//       this.handleShutdown();
//     });
//   }

//   private handleGameWin() {
//     // NOTE: this might not be possible...
//     console.log('game win');
//   }

//   private handleGameOver() {
//     this.scene.pause(SceneKeys.Game);
//     this.scene.run(SceneKeys.GameOver);
//   }

//   private handleBubbleWillBeDestroyed(bubble: IBubble) {
//     const x = bubble.x;
//     const y = bubble.y;

//     // explosion then go to gameover
//     const particles = this.add.particles(TextureKeys.VirusParticles);
//     particles.setDepth(2000);
//     particles
//       .createEmitter({
//         speed: { min: -200, max: 200 },
//         angle: { min: 0, max: 360 },
//         scale: { start: 0.3, end: 0 },
//         blendMode: Phaser.BlendModes.ADD,
//         tint: bubble.color,
//         lifespan: 300
//       })
//       .explode(50, x, y);
//   }

//   private handleShutdown() {
//     this.scene.stop(SceneKeys.GameUI);

//     this.grid?.destroy();
//   }

//   private processBubbleHitGrid(
//     bubble: Phaser.GameObjects.GameObject,
//     gridBubble: Phaser.GameObjects.GameObject
//   ) {
//     // only accept collision if distance is close enough
//     // gives a better feel for tight shots
//     const b = bubble as IBubble;
//     const gb = gridBubble as IBubble;

//     const active = b.active && gb.active;

//     if (!active) {
//       return false;
//     }

//     const distanceSq = Phaser.Math.Distance.Squared(b.x, b.y, gb.x, gb.y);
//     const minDistance = b.width * 0.9;
//     const mdSq = minDistance * minDistance;

//     return distanceSq <= mdSq;
//   }

//   private async handleBubbleHitGrid(
//     bubble: Phaser.GameObjects.GameObject,
//     gridBubble: Phaser.GameObjects.GameObject
//   ) {
//     const b = bubble as IBubble;
//     const bx = b.x;
//     const by = b.y;
//     const color = b.color;

//     const vx = b.body.deltaX();
//     const vy = b.body.deltaY();

//     const gb = gridBubble as IBubble;
//     const gx = gb.x;
//     const gy = gb.y;

//     // determine direction from bubble to grid
//     // then negate it to have opposite direction
//     const directionToGrid = new Phaser.Math.Vector2(gx - bx, gy - by)
//       .normalize()
//       .negate();

//     // get where the bubble would be at contact with grid
//     const x = gx + directionToGrid.x * gb.width;
//     const y = gy + directionToGrid.y * gb.width;

//     await this.grid?.attachBubble(x, y, color, gb, vx, vy);
//   }

//   update(t, dt): void {
//     // this.fpsText.update();
//     // if (this.state === GameState.GameOver || this.state === GameState.GameWin) {
//     //   return;
//     // }
//     // this.bubbleSpawnModel.update(dt);
//   }
// }
