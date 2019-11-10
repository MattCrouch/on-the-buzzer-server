const Button = require("./Button");
const BUTTON_EVENTS = require("./events/button");
const WEBSOCKET_EVENTS = require("./events/websocket");

const { broadcast, close } = require("./websocket");

const BUTTON_1 = new Button("Button 1", "4C-EF-C0-A6-A8-69");
const BUTTON_2 = new Button("Button 2", "00-71-47-CB-B6-3D");

let questionState;

if (BUTTON_1) {
  BUTTON_1.connect()
    .then(() => {
      BUTTON_1.on(BUTTON_EVENTS.DOWN, () => {
        console.log("1️⃣ - BUTTON 1");

        if (!questionState) {
          questionState = 1;

          broadcast(WEBSOCKET_EVENTS.BUZZ, {
            button: 1
          });
        }
      });
    })
    .catch(() => {
      BUTTON_1.close();
    });
}

if (BUTTON_2) {
  BUTTON_2.connect()
    .then(() => {
      BUTTON_2.on(BUTTON_EVENTS.DOWN, () => {
        console.log("2️⃣ - BUTTON 2");

        if (!questionState) {
          questionState = 2;

          broadcast(WEBSOCKET_EVENTS.BUZZ, {
            button: 2
          });
        }
      });
    })
    .catch(() => {
      BUTTON_2.close();
    });
}

process.on("SIGINT", () => {
  console.log("Shutting down...");

  if (BUTTON_1) {
    BUTTON_1.close();
  }
  if (BUTTON_2) {
    BUTTON_2.close();
  }

  close();

  process.exit();
});
