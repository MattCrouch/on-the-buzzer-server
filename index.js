const Button = require("./Button");
const EVENTS = require("./buttonEvents");

const BUTTON_1 = new Button("Button 1", "4C-EF-C0-A6-A8-69");
const BUTTON_2 = new Button("Button 2", "00-71-47-CB-B6-3D");

BUTTON_1.connect()
  .then(() => {
    BUTTON_1.on(EVENTS.DOWN, () => {
      console.log("💥 PLAYER 1");
    });
  })
  .catch(() => {
    BUTTON_1.close();
  });

BUTTON_2.connect()
  .then(() => {
    BUTTON_2.on(EVENTS.DOWN, () => {
      console.log("💥 PLAYER 2");
    });
  })
  .catch(() => {
    BUTTON_2.close();
  });

process.on("SIGINT", () => {
  console.log("Shutting down...");
  BUTTON_1.close();
  BUTTON_2.close();
  process.exit();
});
