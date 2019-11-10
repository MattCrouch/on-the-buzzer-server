const { BluetoothSerialPort } = require("bluetooth-serial-port");
const EVENTS = require("./buttonEvents");

const BUTTON_STATE_POSITION = 29;

class Button {
  constructor(name, address) {
    this.name = name;
    this.address = address;
    this.subscribers = [];
  }

  log(message) {
    console.log(`${this.name}`, message);
  }

  connect() {
    this.connection = new BluetoothSerialPort();

    this.connection.findSerialPortChannel(
      this.address,
      channel => {
        this.connection.connect(
          this.address,
          channel,
          () => {
            this.log("connected");

            this.connection.on("data", buffer => {
              if (buffer.length !== 40) {
                // Not a button event (e.g. initialisation)
                return;
              }

              const isPressed = buffer[BUTTON_STATE_POSITION] === 0x02;

              this.subscribers.forEach(subscriber =>
                subscriber(isPressed ? EVENTS.DOWN : EVENTS.UP)
              );
            });
          },
          () => {
            this.log("cannot connect");
          }
        );
      },
      () => {
        this.log("Found nothing");
      }
    );
  }

  close() {
    this.connection.close();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }
}

module.exports = Button;
