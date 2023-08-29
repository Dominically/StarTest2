
/**
 * List of control types:
 * "pitch"
 * "yaw"
 * "roll"
 * "speed"
 * 
 *  All must have an activate function and return a list that mutates when input happens
 */
let kbmappings = {
    "pitch": ["s", "w"],
    "yaw": ["a", "d"],
    "roll": ["q", "e"],
    "speed": ["c", "shift"]
}

let standard_mappings = { //Currently only using axis mappings.
    "pitch": 1,
    "yaw": 0,
    "roll": 2,
    "speed": [6, 7]
}

let touch_mappings = {
    "pitch": "dragvert",
    "yaw": "draghoriz",
    "roll": "rotate",
    "speed": "plane"
}

const DEADZONE = 0.1;

let keysPressed = {};

// interface Touch {
//     touch_id: number,
//     startPos: [number, number]
// }

/**
 * @type {[{touch_id: number, startPos: [number, number]. lastPos: [number, number]}]}
 */
let screenTouches = [];

console.log("Input");
export function setup(){
    window.addEventListener("keydown", (evt)=>{
        keysPressed[evt.key.toLowerCase()] = true;
    });
    
    window.addEventListener("keyup", (evt)=>{
        keysPressed[evt.key.toLowerCase()] = false;
    });

    window.addEventListener("touchstart", (evt)=>{
        for (let touch of evt.changedTouches) {
            if (screenTouches.length < 2) { //Ignore any more than 2 touches.
                let touchPos = [touch.clientX, touch.clientY];
                screenTouches.push({
                    touch_id: touch.identifier,
                    startPos: touchPos,
                    lastPos: [...touchPos] //Shallow copy of the array to prevent mutability issues.
                }); 
            }
        }
    });

    window.addEventListener("touchmove", (evt)=>{ //Update touch position.
        for (let touch of evt.changedTouches){
            let screenTouch = screenTouches.find((cmp)=>cmp.touch_id===touch.identifier);
            if (screenTouch) {
                screenTouch.lastPos = [touch.clientX, touch.clientY];
            }
        }
    });

    window.addEventListener("touchend", (evt) => {
        if (evt.changedTouches.length > 0) {
            screenTouches = []; //Remove all touches to prevent conflict.
        }
    });

    window.addEventListener("touchcancel", (evt) => { //This never gets called.
        if (evt.changedTouches.length > 0) {
            screenTouches = []; //Remove all touches to prevent conflict.
        }
    });
}
/**
 * @typedef {{control: string, lo: number,hi: number, normal: number, callback:(val: number)=>void}} Query
 * @param {Query[]} queries 
 */
export function update(queries){ //Handles keyboard and gamepad input.
    /**@type {Gamepad}*/
    let gamepad = null;
    for (let gp of navigator.getGamepads()){
        if (gp && gp.connected){
            gamepad = gp;
            break;
        }
    }

    let query_responses = [];
    for (let q of queries){
        let kb_mapping = kbmappings[q.control];

        let lo_press = keysPressed[kb_mapping[0]];
        let hi_press = keysPressed[kb_mapping[1]];


        let result;
        if (lo_press && hi_press){
            result = q.normal;
        } else if (lo_press && !hi_press){
            result = q.lo;
        } else if (!lo_press && hi_press) {
            result = q.hi;
        } else {
            let strength = 0;
            if (gamepad) {
                let gpmap = standard_mappings[q.control];
                if (typeof gpmap === "number"){ //Axis
                    let axis = gamepad.axes[gpmap];
                    if (Math.abs(axis) < DEADZONE){
                        strength = 0;
                    } else if (gpmap%2===0){ //Invert vertical.
                        strength = axis;
                    } else {
                        strength = -axis;
                    }
                } else {
                    strength = gamepad.buttons[gpmap[1]].value - gamepad.buttons[gpmap[0]].value;
                }
            } else if (screenTouches.length > 0) {
                strength = getTouchValue(touch_mappings[q.control]);
            }
            
            
            if (strength < 0) { //Left or down.
                result = q.normal + (q.normal - q.lo)*strength;
            } else if (strength > 0){ //Right or up.
                result = q.normal + (q.hi - q.normal)*strength;
            } else { //Centered.
                result = q.normal;
            }
        }

        q.callback(result);
    }
}

/**@param {string} value */
function getTouchValue(value) {
    let vert = 0;
    let horiz = 0;
    let rotation = 0;
    if (screenTouches.length === 1) { //Vertical and horizontal dragging.
        let horiz_delta = screenTouches[0].lastPos[0] - screenTouches[0].startPos[0]; //Calculate horizontal finger distance.
        let vert_delta = screenTouches[0].lastPos[1] - screenTouches[0].startPos[1];
        horiz = Math.min(Math.max(horiz_delta/1000, -1), 1);
        vert = -Math.min(Math.max(vert_delta/1000, -1), 1);
    } else if (screenTouches.length === 2) { //Calculate rotations.
        let start_dx = screenTouches[1].startPos[0] - screenTouches[0].startPos[0]; //Find deltas.
        let start_dy = screenTouches[1].startPos[1] - screenTouches[0].startPos[1];
        let current_dx = screenTouches[1].lastPos[0] - screenTouches[0].lastPos[0];
        let current_dy = screenTouches[1].lastPos[1] - screenTouches[0].lastPos[1];
        
        if (start_dx < 0) { //If fingers are the opposite way round switch everything.
            start_dx *=-1;
            start_dy *=-1;
            current_dx *=-1;
            current_dy *=-1;
        }

        let start_angle = Math.atan2(start_dy, start_dx);
        let current_angle = Math.atan2(current_dy, current_dx);
        let delta_angle = current_angle - start_angle;
        let delta_angle_adj = ((delta_angle + Math.PI) % (2 * Math.PI)) - Math.PI; //Adjust angle to fit between -180 and 180 degrees.

        rotation = -Math.min(Math.max(delta_angle_adj * 2 / Math.PI, -1), 1) //Limit to 90 degrees and invert     
    }

    switch (value) {
        case "dragvert":
            return vert;
        case "draghoriz":
            return horiz;
        case "rotate":
            return rotation;
        default:
            return 0;
    }
}


function rad(deg) {
    return Math.round(deg*180/Math.PI);
}
