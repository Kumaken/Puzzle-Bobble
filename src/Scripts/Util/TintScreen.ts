import AlignTool from "./AlignTool";


class Tint {

    private tintPanel: Phaser.GameObjects.Rectangle | undefined;

    private static instance: Tint;

    public static get Instance() {
      return this.instance || (this.instance = new this());
    
    }

    public tint(scene:Phaser.Scene,alpha: number = 0.5, color:number = 0x000000, depth: number = 1)
    {
        if(this.tintPanel === undefined)
        {
            this.tintPanel = scene.add.rectangle(AlignTool.getCenterHorizontal(scene), AlignTool.getCenterVertical(scene), scene.cameras.main.width, scene.cameras.main.height, color, alpha)
        }
        else
        {
            this.tintPanel.setVisible(true);
        }

        this.tintPanel.setDepth(depth);
    }

    public untint()
    {
        this.tintPanel.setVisible(false);
    }
}
  

export const tintScreen = Tint.Instance;