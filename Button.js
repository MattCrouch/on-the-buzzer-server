const { BluetoothSerialPort } = require("bluetooth-serial-port");

const BUTTON_STATE_BUFFER_POSITION = 29;

class Button {
  constructor(name, address) {
    this.name = name;
    this.address = address;
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
              // console.log("> receiving (" + buffer.length + " bytes):", buffer);
              // console.log([...buffer]);
              // console.log([...buffer][BUTTON_STATE_BUFFER_POSITION]);

              // var isPressed = buffer[buffer.length - 2] == 0xc0;
              // console.log(
              //   " >> button is " + (isPressed ? "pressed" : "released")
              // );

              this.log("event");
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
}

module.exports = Button;
