const EventEmitter = require("events");
const { BluetoothSerialPort } = require("bluetooth-serial-port");
const EVENTS = require("./events/button");

const BUTTON_STATE_POSITION = 29;

class Button extends EventEmitter {
  constructor(name, address) {
    super();
    this.name = name;
    this.address = address;
  }

  log(...args) {
    console.log(`📣 ${this.name}`, ...args);
  }

  async connect() {
    this.log("connecting...");

    return new Promise((resolve, reject) => {
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

                this.emit(isPressed ? EVENTS.DOWN : EVENTS.UP);
              });

              resolve();
            },
            () => {
              this.log("cannot connect");
              reject();
            }
          );
        },
        () => {
          this.log("Found nothing");
          reject();
        }
      );
    });
  }

  isConnected() {
    return this.connection.isOpen();
  }

  close() {
    if (this.connection.isOpen()) {
      this.connection.close();
    }
  }
}

module.exports = Button;
