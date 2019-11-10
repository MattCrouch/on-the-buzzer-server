const Button = require("./Button");

const BUTTON_1 = new Button("Button 1", "4C-EF-C0-A6-A8-69");
const BUTTON_2 = new Button("Button 2", "00-71-47-CB-B6-3D");

BUTTON_1.connect();
BUTTON_2.connect();

process.on("SIGINT", () => {
  console.log("> closing bluetooth connection.");
  BUTTON_1.close();
  BUTTON_2.close();
  process.exit();
});
