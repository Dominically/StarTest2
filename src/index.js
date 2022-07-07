//@ts-check
import * as wasm from "startest2";
import pixiapp from "./pixiapp.js";
import * as input from "./input/input.js"
let app = new pixiapp();
app.addToPage();

console.log(wasm.add(1,2));
let universe = wasm.new_universe(window.innerWidth, window.innerHeight);
window.onresize = ()=>{
    universe.set_size(window.innerWidth, window.innerHeight);
    app.updateSize();
};

let fps_counts = [0];

setInterval(()=>{
    let period = 0;
    let total_fps = 0;
    for (let c of fps_counts){
        period+=0.25;
        total_fps += c;
    }
    app.setFps(total_fps/period);
    if (fps_counts.length == 4){
        fps_counts.shift()
    }

    fps_counts.push(0);
        
}, 250);

input.setup();

app.getTicker().add((delta)=>{
    fps_counts[fps_counts.length-1]++;
    let num_stars = universe.count_stars();
    let buffer = new Float32Array(num_stars * 3);

    updateInputs();
    let start_time = Date.now();let time = Date.now() - start_time;
    if (time > 5){
        console.log("Slow calculation: ", time, "ms");
    }
    universe.tick(delta);
    let stars_to_project = universe.project_stars(buffer);
    let rratio = universe.get_render_dist_ratio();
    app.renderStars(stars_to_project, buffer);

    
    let direction_vecs = new Float32Array(9);
    universe.get_camera_vecs(direction_vecs);
    app.update_compass(direction_vecs);
});

function updateInputs(){
    let results = input.update([
        {
            control: "roll",
            hi: -0.05,
            lo: 0.05,
            normal: 0,
            callback: (v)=>{universe.set_camera_roll_vel(v)},
        },
        {
            control: "pitch",
            hi: -0.05,
            lo: 0.05,
            normal: 0,
            callback: (v)=>{universe.set_camera_pitch_vel(v)},
        },
        {
            control: "yaw",
            hi: 0.05,
            lo: -0.05,
            normal: 0,
            callback: (v)=>{universe.set_camera_yaw_vel(v)},
        },
        {
            control: "speed",
            hi: 40,
            lo: -40,
            normal: 2,
            callback: (v)=>{universe.set_thrust(v)},
        },
    ]);
}