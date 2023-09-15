import "startest2";
import StarTestApp from "startest2";

const ratio = window.devicePixelRatio;
console.log(`Device pixel ratio: ${ratio}`);
let app = new StarTestApp(true, true, 1536.0);

app.bindContainer(document.body);
app.initControls();
app.runSimulation();