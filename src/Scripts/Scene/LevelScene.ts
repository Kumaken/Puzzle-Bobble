import * as Phaser from "phaser";
import FpsText from "../Object/FpsText";

import {TextPopUp} from "../Util/TextPopUp"
import AlignTool from "../Util/AlignTool";
export default class LevelScene extends Phaser.Scene {

  private fpsText:FpsText;

  constructor() {
    super({ key: "LevelScene" });
  }

  preload(): void 
  {
     
  }

  create(): void 
  {
      this.fpsText = new FpsText(this);

      

  }

  update(): void 
  {
    this.fpsText.update();
  }
}
