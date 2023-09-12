import "startest2";
import StarTestApp from "startest2";

let app = new StarTestApp(false, false, 1024.0);

app.bindContainer(document.body);
app.initControls();
app.runSimulation();