import * as Phaser from 'phaser';
import AnimationHelper from './AnimationHelper'

export interface ITextConfig {
  x: number;
  y: number;
  size: number;
  text: string;
  color: string;
  duration: number;
  font?: string;
  hasShadow?: boolean;
  shadowColor?: string;
  bold?: boolean;
  easeIn?:boolean;
}

class TextPopUpHelper {
  private m_text: Phaser.GameObjects.Text | undefined = undefined;
  private static m_instance: TextPopUpHelper;
  private m_timeEvent: Phaser.Time.TimerEvent | undefined = undefined;

  private m_shadow: Phaser.GameObjects.Text | undefined = undefined;

  public static get Instance() {
    return this.m_instance || (this.m_instance = new this());
  }

  showText(
    scene: Phaser.Scene,
    config: ITextConfig,
  ): Phaser.GameObjects.Container {
    if (this.m_text !== undefined) {
      this.m_text.destroy();
      this.m_shadow?.destroy();
    }

    this.m_shadow = scene.add.text(1, config.size / 11, config.text, {
      color: config.shadowColor,
      fontSize: config.size.toString() + 'px',
      font: config.font
    });
    this.m_shadow.setOrigin(0.5).setPadding(25, 25, 25, 25);

    if (config.hasShadow) this.m_shadow.setVisible(config.hasShadow);

    if (config.bold) this.m_shadow.setFontStyle('bold');

    this.m_text = scene.add.text(0, 0, config.text, {
      color: config.color,
      fontSize: config.size.toString() + 'px',
      font: config.font
    });

    this.m_text.setOrigin(0.5).setPadding(25, 25, 25, 25);

    if (config.bold) this.m_text.setFontStyle('bold');

    if (this.m_timeEvent !== undefined) {
      this.m_timeEvent.destroy();
    }

    this.m_timeEvent = scene.time.addEvent({
      delay: config.duration * 1000,
      callback: () => {
        if (this.m_text !== undefined) this.m_text.setVisible(false);

        if (this.m_shadow !== undefined) {
          this.m_shadow.setVisible(false);
        }
      },
    });

    let tempText: Phaser.GameObjects.Text = this.m_text;

    let shadow: Phaser.GameObjects.Text = this.m_shadow;

    let textObject = new Phaser.GameObjects.Container(scene, config.x, config.y, [
      shadow,
      tempText,
    ]);

    scene.add.existing(textObject);

    textObject.setDepth(2);

    if(config.easeIn)
    {
      AnimationHelper.EaseInAndFade(scene, textObject, config.duration);
    }

    return textObject;
  }
}

export const TextPopUp = TextPopUpHelper.Instance;
