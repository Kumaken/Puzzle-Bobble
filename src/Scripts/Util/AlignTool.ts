import 'phaser'


export default class AlignTool {
  static scaleToGameW(scene:Phaser.Scene, obj:any, percentage: number) {
    obj.displayWidth = scene.cameras.main.width * percentage;
    obj.scaleY = obj.scaleX;
  }

  static fitToScreen(scene:Phaser.Scene, obj:any)
  {
    obj.displayWidth = scene.cameras.main.width;
    obj.displayHeight = scene.cameras.main.height;
  }

  static centerH(scene:Phaser.Scene, obj:any) {
    obj.x = scene.cameras.main.width / 2;
  }
  static centerV(scene:Phaser.Scene, obj:any) {
    obj.y =  scene.cameras.main.height / 2;
  }
  static centerBoth(scene:Phaser.Scene, obj:any) {
    obj.x =  scene.cameras.main.width / 2;
    obj.y =  scene.cameras.main.height / 2;
  }

  static getCenterH(scene:Phaser.Scene)
  {
    return scene.cameras.main.width / 2;
  }

  static getCenterV(scene:Phaser.Scene)
  {
    return scene.cameras.main.height / 2;
  }

}
