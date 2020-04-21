import "phaser";
import {config, PhaserConfig} from "./Config/PhaserConfig"

var game;

export class PhaserGame extends Phaser.Game {
  constructor(config: PhaserConfig) {
    super(config);
  }
}
window.onload = () => {
   game = new PhaserGame(config);
};

export function getGame()
{
    return game;
}