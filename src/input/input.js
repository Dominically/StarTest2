
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

                console.log("Touch added. Length:", screenTouches.length);
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
        } else if (gamepad) {
            let gpmap = standard_mappings[q.control];
            let strength;
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
            
            if (strength < 0) { //Left or down.
                result = q.normal + (q.normal - q.lo)*strength;
            } else if (strength > 0){ //Right or up.
                result = q.normal + (q.hi - q.normal)*strength;
            } else { //Centered.
                result = q.normal;
            }
        } else if (screenTouches.length > 0){ //Touch input
            result = q.normal;
        }

        q.callback(result);
    }
}

/**@param {string} value */
function getTouchValue(value) {
    let vert = 0;
    if (screenTouches.length === 1) { //Vertical and horizontal dragging.
        let vert_delta = screenTouches[0].lastPos - screenTouches[0].startPos;
        vert = Math.max(Math.min(vert_delta/200, -1), 1);
    }

    switch (value) {
        case "dragvert":
            return vert;
            break;
        default:
            return 0;
    }
}
