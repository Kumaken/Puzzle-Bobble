import * as Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {

  }

  create(): void {
    this.scene.start("TitleScene");
  }
}
