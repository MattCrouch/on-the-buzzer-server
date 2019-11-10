const WebSocket = require("ws");
const url = require("url");
const uuid = require("uuid/v4");

const PING_INTERVAL = 30000;

// Start the server
const server = new WebSocket.Server({ port: 8080 });

// Check the client is still around
const ping = () => {
  server.clients.forEach(client => {
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
};

// What to do when the client responds to the ping
const pong = () => {
  // Mark them as still alive before the next set of pings
  this.isAlive = true;
};

// Make sure all clients are still around
const interval = setInterval(ping, PING_INTERVAL);

// Define what happens when a client connects
server.on("connection", (client, req) => {
  // See if they have an ID already
  const {
    query: { id }
  } = url.parse(req.url, true);

  // Add client with ID
  addClient(client, id);
});

const addClient = (client, connectionId) => {
  // Generate a unique ID, or use the one supplied
  const id = connectionId ? connectionId : uuid();
  client.id = id;

  // Record client is still alive
  client.on("pong", pong);
};

// Tell all clients about something happening
const broadcast = (event, payload) => {
  server.clients.forEach(client => {
    // Check if the client is still active
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          event,
          payload
        })
      );
    }
  });
};

const close = () => {
  server.close();
};

module.exports = {
  broadcast,
  close
};
