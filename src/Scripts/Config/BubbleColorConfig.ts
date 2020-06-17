// Mapped to initial default texture for every kind of bubble color
enum BubbleColorConfig {
  Red = 'bubble-red',
  Blue = 'bubble-blue',
  Green = 'bubble-green',
  Yellow = 'bubble-yellow',
  White = 'bubble-purple',
  Black = 'bubble-black',
  Purple = 'bubble-purple',
  Any = '-1'
}

const colorIsMatch = (
  first: BubbleColorConfig,
  second: BubbleColorConfig
): boolean => {
  if (first === BubbleColorConfig.Any || second === BubbleColorConfig.Any) {
    return true;
  }

  return first === second;
};

export default BubbleColorConfig;

export { colorIsMatch };
