import ColorConfig from './ColorConfig';

enum TextureKeys {
  Background = 'background',
  Bubble = 'bubble',
  BubbleRed = 'bubble-red',
  BubbleGreen = 'bubble-green',
  BubbleBlue = 'bubble-blue',
  BubbleYellow = 'bubble-yellow',
  BubblePurple = 'bubble-purple',
  BubbleWhite = 'bubble-white',
  BubbleBlack = 'bubble-black',
  BubblePop = 'bubble-pop',
  Shooter = 'shooter'
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
