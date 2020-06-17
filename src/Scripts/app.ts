import 'phaser';
import { config, PhaserConfig } from './Config/PhaserConfig';
import registerScenes from './registerScenes';
import SceneKeys from './Config/SceneKeys';

let game: PhaserGame;

export class PhaserGame extends Phaser.Game {
  constructor(config: PhaserConfig) {
    super(config);
  }
}
window.onload = () => {
  game = new PhaserGame(config);
  registerScenes(game); // register all available scenes to game obj
  game.scene.start(SceneKeys.Preload);
};

export function getGame(): PhaserGame {
  return game;
}
