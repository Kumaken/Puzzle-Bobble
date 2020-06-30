export type PhaserConfig = Phaser.Types.Core.GameConfig;

import { getResolution } from '../Util/Util';

export const config: PhaserConfig = {
  title: 'PhaserGame',
  type: Phaser.AUTO,
  dom: {
    createContainer: true // this is needed for dom funtions to work!
  },
  scale: {
    parent: 'phaser-app',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: getResolution().width,
    height: getResolution().height
  },
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true
    }
  },
  backgroundColor: '#493a52'
};
