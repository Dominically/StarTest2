import "startest2";
import StarTestApp from "startest2";

let app = new StarTestApp(true, true, 1536.0);

app.bindContainer(document.body);
app.initControls();
app.runSimulation();