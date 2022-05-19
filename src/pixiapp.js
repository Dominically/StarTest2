//@ts-check
import * as PIXI from "pixi.js";

export default class PixiApp {
    constructor(){
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: true
        });

        this.starContainer = new PIXI.Container();
        this.app.stage.addChild(this.starContainer);

        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xffffff);
        
        graphics.drawCircle(0,0,50);
        graphics.endFill();
        this.texture = this.app.renderer.generateTexture(graphics);

        this.compass = new PIXI.Graphics();
        this.compass.x = 100;
        this.compass.y = 75;
        this.app.stage.addChild(this.compass);

        this.direction = new PIXI.Text("Direction: Unknown", {
            fill: 0xFFFFFF,
            fontSize: 20
        });
        this.direction.x = 20;
        this.direction.y = 150;
        this.app.stage.addChild(this.direction);

        this.fps = new PIXI.Text("FPS: Unknown", {
            fill: 0xFFFFFF,
            fontSize: 20
        });
        this.fps.x = 20;
        this.fps.y = 10;
        this.app.stage.addChild(this.fps);

    }

    getTicker(){
        return this.app.ticker;
    }

    addToPage() {
        document.body.appendChild(this.app.view);

    }

    updateSize(){
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    renderStars(num_stars, positions){
        let container = this.starContainer;
        let offset = 0;

        let to_make_stars = num_stars - container.children.length;

        for (let i = 0; i < container.children.length; i++) {
            this._position_star(container.getChildAt(i), positions, offset);
            offset += 3;
        }
        
        if (to_make_stars < 0) { //Stars need to be deleted
            container.removeChildren(num_stars, container.children.length);
        } else {
            for (let i = 0; i < to_make_stars; i++){
                let circle = new PIXI.Sprite(this.texture);
                circle.pivot.set(25, 25);
                this._position_star(circle, positions, offset);
                container.addChild(circle);
                offset += 3;
            }
        }

        
    }

    _position_star(circle, positions, offset){
        let l = positions[offset];
        let x = positions[offset+1];
        let y = positions[offset+2];
        
        circle.scale.set(l, l);
        circle.x = x;
        circle.y = y;
    }

    update_compass(vecs) {
        let xx = vecs[0], xy = -vecs[3], xz = vecs[6], yx = vecs[1], yy = -vecs[4], yz = vecs[7], zx = vecs[2], zy = -vecs[5], zz = vecs[8];
        let comp = this.compass;
        const d = 50;
        comp.clear();

        let drawX = ()=>{
            comp.lineStyle({
                width: 5,
                color: 0xFF7F7F,
            });
    
            comp.lineTo(xx*d, xy*d);
        }

        let drawY = () => {
            comp.lineStyle({
                width: 5,
                color: 0x7FFF7F,
            });

            comp.lineTo(yx*d, yy*d);
        }
        
        let drawZ = () => {
            comp.lineStyle({
                width: 5,
                color: 0x7F7FFF,
            });
    
            comp.lineTo(zx*d, zy*d);
        }

        let fns = [
            [xz, drawX],
            [yz, drawY],
            [zz, drawZ]
        ];
        
        fns.sort((an, bn)=>{
            if (an[0] > bn[0]){
                return -1;
            } else if (bn[0] > an[0]){
                return 1;
            }
            return 0;
        }); //Sort vectors by z.


        comp.beginFill();
        fns.forEach((an)=>{
            an[1]();
            comp.moveTo(0,0);
        }); //Call the draw function.
        comp.endFill();

        let z = [vecs[6], vecs[7], vecs[8]]; //Somehow this magically worked when inverted and transposed it so i guess it works now.
        let [max, max_index] = this._mostSignificant(z);
        let dir = "Unknown";
        let positive = max > 0;

        switch (max_index){
            case 0:
                dir = positive?"Right (X+)":"Left (X-)";
                break;
            case 1:
                dir = positive?"Up (Y+)":"Down (Y-)";
                break;
            case 2:
                dir = positive?"Forward (Z+)":"Backwards (Z-)";
                break;
        }

        this.direction.text = "Direction: " + dir;
    }

    _mostSignificant(arr){
        let max = 0;
        let max_index = -1;
        for (let index = 0; index < arr.length; index++) {
            if (Math.abs(arr[index]) > Math.abs(max)) {
                max = arr[index];
                max_index = index;
            }
        }
        return [max, max_index]
    }

    setFps(fps){
        this.fps.text = fps;
    }
}