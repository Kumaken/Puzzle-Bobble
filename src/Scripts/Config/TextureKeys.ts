import ColorConfig from './ColorConfig';

enum TextureKeys {
  Background = 'background',
  Bubble = 'bubble',
  BubbleRed = 'bubble_red',
  BubbleGreen = 'bubble_green',
  BubbleBlue = 'bubble_blue',
  BubbleYellow = 'bubble_yellow',
  BubblePurple = 'bubble_purple',
  BubbleWhite = 'bubble_white',
  BubbleBlack = 'bubble_black',
  BubblePop = 'bubble-pop',
  Shooter = 'shooter',
  ShooterFoundation = 'shooter-foundation',
  PlatformSign = 'platform-sign',
  BubblePlatform = 'bubble-platform',
  TopBorder = 'top-border',
  LeftBorder = 'left-border',
  RightBorder = 'right-border',
  BottomBorder = 'bottom-border',
  DropBottom = 'drop-bottom',
  DropLoop = 'drop-loop',
  BaseBackground = 'base-background',
  Layer1 = 'layer-1',
  Layer2 = 'layer-2',
  Layer3 = 'layer-3',
  Layer4 = 'layer-4',
  Layer5 = 'layer-5',
  Layer6 = 'layer-6',
  Layer7 = 'layer-7'
}

function colorToBubbleTexture(bubbleColor: ColorConfig): TextureKeys {
  switch (bubbleColor) {
    case ColorConfig.Red: {
      return TextureKeys.BubbleRed;
    }
    case ColorConfig.Blue: {
      return TextureKeys.BubbleBlue;
    }
    case ColorConfig.Green: {
      return TextureKeys.BubbleGreen;
    }
    case ColorConfig.Yellow: {
      return TextureKeys.BubbleYellow;
    }
    case ColorConfig.White: {
      return TextureKeys.BubbleWhite;
    }
    case ColorConfig.Black: {
      return TextureKeys.BubbleBlack;
    }
    case ColorConfig.Purple: {
      return TextureKeys.BubblePurple;
    }
  }
}

export default TextureKeys;
export { colorToBubbleTexture };
