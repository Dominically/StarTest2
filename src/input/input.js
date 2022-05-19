
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

let keysPressed = {};

console.log("Input");
export function setup(){
    window.addEventListener("keydown", (evt)=>{
        keysPressed[evt.key.toLowerCase()] = true;
    });
    
    window.addEventListener("keyup", (evt)=>{
        keysPressed[evt.key.toLowerCase()] = false;
    });
}
/**
 * @typedef {{control: string, lo: number,hi: number, normal: number, callback:(val: number)=>void}} Query
 * @param {Query[]} queries 
 */
export function update(queries){
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
                if (gpmap%2===0){ //Invert vertical.
                    strength = gamepad.axes[gpmap];
                } else {
                    strength = -gamepad.axes[gpmap];
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
        } else {
            result = q.normal;
        }

        q.callback(result);
    }
}
