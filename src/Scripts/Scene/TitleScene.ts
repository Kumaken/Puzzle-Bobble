import * as Phaser from "phaser";
import FpsText from "../Object/FpsText";
import AlignTool from "../Util/AlignTool"
import {TextPopUp} from "../Util/TextPopUp"
import AnimationHelper from "../Util/AnimationHelper";
export default class TitleScene extends Phaser.Scene {

  private fpsText:FpsText;

  constructor() {
    super({ key: "TitleScene" });
  }

  preload(): void 
  {
     
  }

  create(): void 
  {
      this.fpsText = new FpsText(this);

      console.log(this.fpsText.scale);
      AnimationHelper.EaseInAndFade(this, this.fpsText, 5);
  }

  update(): void 
  {
    this.fpsText.update();
  }
}
