# node-chatpad
This library provides a driver for reading XBOX 360 Chatpad serial data in NodeJS. It also maps th chatpad key codes to ASCII values where possible.

## Installation
`npm i chatpad`

## Example
```
const Chatpad = require('..');

(async() => {
    const pad = new Chatpad('/dev/ttyUSB0');
    await pad.open();

    pad.on('key', (keys) => {
        console.log('key', keys);
    });

    pad.on('modifier', (keys) => {
        console.log('modifier', keys);
    });

    pad.on('error', (err) => {
        console.log('error', err);
    });
})();
```

## API
### Chatpad(port: string)
Constructor, pass the serial port location into here. Should work with Windows serial ports too.
### async Chatpad#open()
Used to open the serialport and initialise the regular message the library needs to send to the Chatpad.
### async Chatpad#close()
Shuts down the timed tasks and closes the serial port.
### on(event, callback)
Sets the event listener for the given event.

### Events
#### key
Sent out whenever a key state changes, excluding modifier keys. Eg:
```
{
  raw: { key: 52, modifier: 0 },
  pressed: true,
  code: 'f',
  caps: false,
  modifier: undefined
}

```
The `raw` object contains the raw key-code and modifier values from the Chatpad. `caps` is tracked by the driver and automatically toggled when the 'Caps' button is pressed. For possible modifier and code values see `map.js`.

#### modifier
Send out whenever the state of a modifier key changes.
```
{
  raw: 4,
  pressed: true,
  modifier: 'orange'
}
```
Raw is the raw modifier byte value. For a list of possible modifier values see `map.js`.

#### error
Error message that's sent out if an invalid packet is received. For most cases this can be ignored because the Chatpad sends packets multiple times to ward against corruption.

## Credits
This work is inspired by Cliffle's:
* http://cliffle.com/project/chatpad/protocol/
* http://cliffle.com/project/chatpad/pinout/
