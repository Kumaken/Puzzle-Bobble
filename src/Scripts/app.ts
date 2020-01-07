import "phaser";
import GameScene from "./Scene/GameScene";
import PreloadScene from "./Scene/PreloadScene";
type GameConfig = Phaser.Types.Core.GameConfig;

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 1200;

const config: GameConfig = {
  title: "PhaserGame",
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  backgroundColor: "#493a52",
  scene: [PreloadScene, GameScene]
 
};

export class PhaserGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}
window.onload = () => {
  let game = new PhaserGame(config);
};
