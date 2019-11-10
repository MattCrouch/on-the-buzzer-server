const Button = require("./Button");
const BUTTON_EVENTS = require("./events/button");
const WEBSOCKET_EVENTS = require("./events/websocket");

const WebSocket = require("./WebSocket");
let server;

const BUTTON_1 = new Button("Button 1", "4C-EF-C0-A6-A8-69");
const BUTTON_2 = new Button("Button 2", "00-71-47-CB-B6-3D");

const buttonsConnected = Promise.all([BUTTON_1.connect(), BUTTON_2.connect()]);

buttonsConnected
  .then(() => {
    server = new WebSocket();

    server.on("message", (event, payload) => {
      if (event === WEBSOCKET_EVENTS.RESET_QUESTION) {
        // Clear ready for the next go
        questionState = undefined;

        server.broadcast(WEBSOCKET_EVENTS.QUESTION_RESETTED);
      }
    });

    BUTTON_1.on(BUTTON_EVENTS.DOWN, () => {
      console.log("1️⃣ - BUTTON 1");

      if (!questionState) {
        questionState = 1;

        server.broadcast(WEBSOCKET_EVENTS.BUZZ, {
          button: 1
        });
      }
    });

    BUTTON_2.on(BUTTON_EVENTS.DOWN, () => {
      console.log("2️⃣ - BUTTON 2");

      if (!questionState) {
        questionState = 2;

        server.broadcast(WEBSOCKET_EVENTS.BUZZ, {
          button: 2
        });
      }
    });
  })
  .catch(() => {
    teardown();
  });

let questionState;

const teardown = () => {
  console.log("Shutting down...");

  if (BUTTON_1) {
    BUTTON_1.close();
  }
  if (BUTTON_2) {
    BUTTON_2.close();
  }

  if (server) {
    server.close();
  }

  process.exit();
};

process.on("SIGINT", () => {
  teardown();
});
