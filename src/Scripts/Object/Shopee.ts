import * as Phaser from "phaser"


export default class Shopee extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene:Phaser.Scene, x:number, y:number)
    {
        super(scene,x, y, "shopee");

        this.scene.add.existing(this);

        scene.physics.add.existing(this);

        this.setInteractive();

        this.setCollideWorldBounds();
        this.setBounce(0.6);

        this.setGravity(0, 400);

        this.on('pointerdown', function(){
            this.setVelocity(0, -600);
         });
    }
}