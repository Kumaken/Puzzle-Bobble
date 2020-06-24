import SceneKeys from './Config/SceneKeys';

import TitleScene from './Scene/TitleScene';
import PreloadScene from './Scene/PreloadScene';
import GameUI from './Scene/GameUI';
import LevelScene from './Scene/LevelScene';
import GameOverScene from './Scene/GameOver';

const registerScenes = (game: Phaser.Game): void => {
  const scene = game.scene;
  scene.add(SceneKeys.Preload, PreloadScene);
  scene.add(SceneKeys.TitleScreen, TitleScene);
  scene.add(SceneKeys.GameUI, GameUI);
  scene.add(SceneKeys.Game, LevelScene);
  scene.add(SceneKeys.GameOver, GameOverScene);
};

export default registerScenes;
