import * as Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.path = "src/Assets/";
    this.load.spritesheet("bubble", "bubblesprite.png", {
      frameWidth: 180,
      frameHeight: 180,
    });
  }

  create(): void {
    this.scene.start("TitleScene");
  }
}
