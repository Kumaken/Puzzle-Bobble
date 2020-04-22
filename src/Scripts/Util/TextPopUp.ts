import * as Phaser from "phaser";
import AnimationHelper from "./AnimationHelper";

export interface ITextConfig {
  x: number;
  y: number;
  size: number;
  text: string;
  color: string;
  duration: number;
  font?: string;
  hasOutline?: boolean;
  outlineThickness?: number;
  outlineColor?: string;
  bold?: boolean;
  easeIn?: boolean;
}

class TextPopUpHelper {
  private text: Phaser.GameObjects.Text | undefined = undefined;
  private static instance: TextPopUpHelper;
  private m_timeEvent: Phaser.Time.TimerEvent | undefined = undefined;

  public static get Instance() {
    return this.instance || (this.instance = new this());
  }

  /**
   * Create a text pop up for a certain duration
   * @param scene the current game scene (Phaser.Scene)
   * @param x  position x (number)
   * @param y position u (number)
   * @param size size of text (number)
   * @param text the text content (string)
   * @param color the color of the text (string)
   * @param duration the duration the text appear on screen in seconds (number)
   *
   * Optionals:
   * @param font the font face (string)
   * @param hasOutline does the text have outline (boolean)
   * @param outlineThickness the thickness of the outline (number)
   * @param outlineColor the color of the outline (string)
   * @param bold is the text bold (boolean)
   * @param easeIn does the text has ease in animation (boolean)
   */
  showText(scene: Phaser.Scene, config: ITextConfig): Phaser.GameObjects.Text {
    if (this.text !== undefined) {
      this.text.destroy();
    }

    this.text = scene.add.text(x, y, config.text, {
      color: config.color,
      fontSize: config.size.toString() + "px",
      font: config.font,
    });

    if (config.hasOutline) {
      this.text.setStroke(config.outlineColor, config.outlineThickness);
    }

    this.text.setOrigin(0.5).setPadding(25, 25, 25, 25);

    if (config.bold) this.text.setFontStyle("bold");

    if (this.m_timeEvent !== undefined) {
      this.m_timeEvent.destroy();
    }

    this.m_timeEvent = scene.time.addEvent({
      delay: config.duration * 1000,
      callback: () => {
        if (this.text !== undefined) this.text.setVisible(false);
      },
    });

    this.text.setDepth(2);

    if (config.easeIn) {
      AnimationHelper.EaseInAndFade(scene, this.text, config.duration);
    }

    return this.text;
  }
}

export const TextPopUp = TextPopUpHelper.Instance;
