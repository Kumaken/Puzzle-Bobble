import * as Phaser from "phaser"

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
        this.load.path = "src/Assets/";
        this.load.image("shopee" , "shopee.png");
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
