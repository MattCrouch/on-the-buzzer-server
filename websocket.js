const EventEmitter = require("events");
const ws = require("ws");
const url = require("url");
const uuid = require("uuid/v4");
const WEBSOCKET_EVENTS = require("./events/websocket");

const PING_INTERVAL = 30000;

class WebSocket extends EventEmitter {
  constructor() {
    super();

    this.server = new ws.Server({ port: 8080 });

    this.server.on("connection", (client, req) => {
      // See if they have an ID already
      const {
        query: { id }
      } = url.parse(req.url, true);

      // Add client with ID
      this.addClient(client, id);
    });

    // Make sure all clients are still around
    setInterval(this.ping.bind(this), PING_INTERVAL);
  }

  log(...args) {
    console.log(`🖥 Server`, ...args);
  }

  ping() {
    this.server.clients.forEach(client => {
      this.log(`pinging ${client.id}`);
      // If the client hasn't responded since the last ping...
      if (client.isAlive === false) {
        // ...kill the connection
        client.terminate();
      }

      // If the client is still alive...
      if (client.readyState === WebSocket.OPEN) {
        // Mark them as awaiting a response
        client.isAlive = false;
        // Send the ping
        client.ping();
      }
    });
  }

  addClient(client, connectionId) {
    // Generate a unique ID, or use the one supplied
    const id = connectionId ? connectionId : uuid();
    client.id = id;

    this.log(`Client added - ${id}`);

    // Record client is still alive
    client.on("message", this.onClientMessage.bind(this));
    client.on("pong", () => (this.isAlive = true));

    client.send(
      JSON.stringify({
        event: WEBSOCKET_EVENTS.INITIAL_STATE,
        payload: {
          id
        }
      })
    );
  }

  // Define what happens when a message is sent from a client
  onClientMessage(message) {
    try {
      // Decode the string to an object
      const { event, payload } = JSON.parse(message);

      this.emit("message", event, payload);
    } catch {}
  }

  // Tell all clients about something happening
  broadcast(event, payload = {}) {
    this.server.clients.forEach(client => {
      // Check if the client is still active
      if (client.readyState === ws.OPEN) {
        client.send(
          JSON.stringify({
            event,
            payload
          })
        );
      }
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = WebSocket;
