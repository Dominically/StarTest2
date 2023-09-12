import PixiApp from "./pixiapp";
import * as STWasm from "startest2-rust";
import * as input from "./input/input";

export default class StarTestApp {
  constructor (useFPSCounter, useCompass, viewDistance) {
    this.pixiApp = new PixiApp(useCompass, useCompass, useFPSCounter); //Create pixi app.

    if (STWasm.add(1,2) !== 3) { //Test WASM functionality.
      throw "WASM Package is not working correctly for some reason!";
    }

    this.universe = STWasm.new_universe(128, 128, viewDistance);
    this.containerElement = null;
    
    this.resizeObserver = new ResizeObserver((resizeEvent)=>{ //hopefully this will call on first run...
      for (let resizedItem of resizeEvent) {
        if (this.containerElement && resizedItem.target === this.containerElement) {
          let w = resizedItem.contentRect.width;
          let h = resizedItem.contentRect.height;

          this.universe.set_size(w, h);
          this.pixiApp.resize(w, h);
        }
      }
    });

    this.fps_counts = [0];
  }

  bindContainer(element){
    if (this.containerElement) {
    throw "App already has parent element!";  
    } else {
      element.appendChild(this.pixiApp.getView());
      this.resizeObserver.observe(element);
      this.containerElement = element;
    }
  }

  initControls() { //Setup keybinds and stuff.
    input.setup();
  }

  runSimulation() { //no stop feature will be added
    setInterval(() => { //Update fps counter 4 times per second.
      let period = 0;
      let total_fps = 0;
      for (let c of this.fps_counts) {
        period += 0.25;
        total_fps += c;
      }

      this.pixiApp.setFps(total_fps/period);

      if (this.fps_counts.length == 4) {
        this.fps_counts.shift();
      }

      this.fps_counts.push(0);
    }, 250);

    this.pixiApp.getTicker().add((delta) => {
      this.fps_counts[this.fps_counts.length - 1]++;
      let num_stars = this.universe.count_stars();
      let buffer = new Float32Array(num_stars * 3); //* 3 for positions.
      
      this._updateInputs();
      this.universe.tick(delta);

      let stars_to_project = this.universe.project_stars(buffer);
      this.pixiApp.renderStars(stars_to_project, buffer);

      let direction_vecs = new Float32Array(9);
      this.universe.get_camera_vecs(direction_vecs);
      this.pixiApp.update_compass(direction_vecs);
    });
  }

  _updateInputs(){
    input.update([
      {
        control: "roll",
        hi: -0.05,
        lo: 0.05,
        normal: 0,
        callback: (v)=>{this.universe.set_camera_roll_vel(v)},
      },
      {
        control: "pitch",
        hi: -0.05,
        lo: 0.05,
        normal: 0,
        callback: (v)=>{this.universe.set_camera_pitch_vel(v)},
      },
      {
        control: "yaw",
        hi: 0.05,
        lo: -0.05,
        normal: 0,
        callback: (v)=>{this.universe.set_camera_yaw_vel(v)},
      },
      {
        control: "speed",
        hi: 40,
        lo: -40,
        normal: 2,
        callback: (v)=>{this.universe.set_thrust(v)},
      },
    ]);
  }
}