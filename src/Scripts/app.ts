import 'phaser';
import { config, PhaserConfig } from './Config/PhaserConfig';
import registerScenes from './registerScenes';
import SceneKeys from './Config/SceneKeys';
import * as React from 'jsx-dom';
window['React'] = React;
export { React };

import './Style/Styles.scss';

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
