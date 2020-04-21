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
  hasOutline?: boolean;
  outlineThickness?: number,
  outlineColor?: string;
  bold?: boolean;
  easeIn?:boolean;
}



class TextPopUpHelper {
  private text: Phaser.GameObjects.Text | undefined = undefined;
  private static m_instance: TextPopUpHelper;
  private m_timeEvent: Phaser.Time.TimerEvent | undefined = undefined;

  public static get Instance() {
    return this.m_instance || (this.m_instance = new this());
  }

  showText(
    scene: Phaser.Scene,
    config: ITextConfig,
  ): Phaser.GameObjects.Text {
    if (this.text !== undefined) {
      this.text.destroy();
    }

    this.text = scene.add.text(0, 0, config.text, {
      color: config.color,
      fontSize: config.size.toString() + 'px',
      font: config.font
    });

    if (config.hasOutline) 
    {   
         this.text.setStroke(config.outlineColor, config.outlineThickness)
    }

    this.text.setOrigin(0.5).setPadding(25, 25, 25, 25);

    if (config.bold) this.text.setFontStyle('bold');

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

    if(config.easeIn)
    {
      AnimationHelper.EaseInAndFade(scene, this.text, config.duration);
    }

    return this.text;
  }
}

export const TextPopUp = TextPopUpHelper.Instance;
