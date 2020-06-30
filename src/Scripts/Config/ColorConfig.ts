// Mapped to initial default texture for every kind of bubble color
// enum BubbleColorConfig {
//   Red = 'bubble-red',
//   Blue = 'bubble-blue',
//   Green = 'bubble-green',
//   Yellow = 'bubble-yellow',
//   White = 'bubble-purple',
//   Black = 'bubble-black',
//   Purple = 'bubble-purple',
//   Any = '-1'
// }

enum ColorConfig {
  PrimaryColor = 0xf84031,
  SecondaryColor = 0xfedd74,
  BackgroundColor = 0x3b2c54,
  GreenColor = 0x196840,
  OrangeColor = 0xef7d3c,
  DarkColor = 0x1c1c1c,
  LightColor = 0xe0e0e0,
  Red = 0xdb0b0b,
  Blue = 0x0b6cdb,
  Green = 0x0bdb23,
  Yellow = 0xdbc60b,
  White = 0xffffff,
  Black = 0x111111, // for some reason, 0x000000 will get converted to just 0, breaking the colouring code!
  Purple = 0x800080,
  Any = '-1'
}

const colorMatches = (first: ColorConfig, second: ColorConfig): boolean => {
  if (first === ColorConfig.Any || second === ColorConfig.Any) {
    return true;
  }

  return first === second;
};

export default ColorConfig;

export { colorMatches };
