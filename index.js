/**
 * This library acesses an Xbox 360 Chatpad over serial and maps the keys to ascii where possible.
 * This work is based upon the work done by Cliffle.
 * Useful webpages can be found here:
 * http://cliffle.com/project/chatpad/protocol/
 * http://cliffle.com/project/chatpad/pinout/
 */
const SerialPort = require('serialport');
const Util = require('util');
const Map = require('./map');

const CHATPAD_BAUD = 19200;
const CHATPAD_INIT = [ 0x87, 0x02, 0x8C, 0x1F, 0xCC ];
const CHATPAD_AWAKE = [ 0x87, 0x02, 0x8C, 0x1B, 0xD0 ];
const CHATPAD_AWAKE_TIME = 500; // Send CHATPAD_AWAKE every interval (ms)

const CHATPAD_PACKET_LENGTH = 8;
const CHATPAD_STATUS_BYTE = 0xA5;
const CHATPAD_EXPECTED_PACKETS = [ 0xB4, 0xC5 ];

function compareKeys(keysA, keysB) {
    if (!keysA || !keysB) {
        return false;
    }
    if (keysA.pressed[0] !== keysB.pressed[0]) {
        return false;
    }
    if (keysA.pressed[1] !== keysB.pressed[1]) {
        return false;
    }
    return true;
}

class Chatpad {
    constructor(port) {
        this.port = new SerialPort(port, {
            baudRate: CHATPAD_BAUD,
            autoOpen: false,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        });
        this.callbacks = [];
        this.keys = {
            pressed: [0, 0],
            modifier: 0,
            caps: false
        };
    }

    on(type, callback) {
        this.callbacks[type] = callback;
    }

    processMessage(data) {
        // Because of timing magic packets are always sent as 8 bytes, if there's less
        // it's an error.
        if (data.length != CHATPAD_PACKET_LENGTH) {
            if (this.callbacks['error']) {
                this.callbacks['error'](new Error(`Packet data length invalid: ${data.length}`));
            }
            return;
        }

        // Ignore status messages
        if (data[0] === CHATPAD_STATUS_BYTE) {
            return;
        }

        // Check for expected packet types.
        if (!CHATPAD_EXPECTED_PACKETS.includes(data[0])) {
            if (this.callbacks['error']) {
                this.callbacks['error'](new Error(`unexpected packet type ${data[0]}`));
            }
            return;
        }

        // Calculate the checksum
        let checksum = 0;
        for (let i = 0; i < 7; i++) {
            checksum += data[i];
        }
        checksum = 256 - (checksum % 256);
        if (checksum !== data[7]) {
            if (this.callbacks['error']) {
                this.callbacks['error'](new Error(`checksum failure expected(${checksum}), actual(${data[7]}`));
            }
            return;
        }

        const keys = {
            // Sorting this is odd but it makes comparing it much easier.
            pressed: [ data[4], data[5] ].sort(),
            modifier: data[3],
            caps: this.keys.caps
        }

        const modifier = keys.modifier || this.keys.modifier;
        if (this.keys.modifier !== keys.modifier && keys.modifier === Map.MODIFIER_CAPS) {
            keys.caps = !keys.caps;
        }

        if (this.callbacks['key']) {
            for (let i = 0; i < 2; i++) {
                if (this.keys.pressed[i] !== keys.pressed[i]) {
                    const key = this.keys.pressed[i] || keys.pressed[i];
                    const raw = {
                        key: key,
                        modifier: modifier
                    };
                    this.callbacks['key']({
                        raw: raw,
                        pressed: !!keys.pressed[i],
                        code: Map.map(raw),
                        caps: keys.caps,
                        modifier: Map.MODIFIERS[raw.modifier]
                    });
                }
            }
        }

        if (this.callbacks['modifier']) {
            if (this.keys.modifier !== keys.modifier) {
                this.callbacks['modifier']({ raw: modifier, pressed: !!keys.modifier, modifier: Map.MODIFIERS[modifier] });
            }
        }
        this.keys = keys;
    }

    async open() {
        this.port.on('data', (data) => {
            try {
                this.processMessage(data);
            } catch (err) {
                try {
                    if (this.callbacks['error']) {
                        this.callbacks['error'](err);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        });
        await Util.promisify(this.port.open.bind(this.port))();

        // Send messages multiple times incase some are lost.
        await this.write(Buffer.from(CHATPAD_INIT));
        await this.write(Buffer.from(CHATPAD_INIT));
        const awake = async() => {
            await this.write(Buffer.from(CHATPAD_AWAKE));
            await this.write(Buffer.from(CHATPAD_AWAKE));
            this.awakeTimer = setTimeout(awake, CHATPAD_AWAKE_TIME);
        };
        awake();
    }

    async close() {
        if (this.awakeTimer) {
            clearTimeout(this.awakeTimer);
            this.awakeTimer = null;
        }
        if (this.port.isOpen) {
            return await Util.promisify(this.port.close.bind(this.port))();
        }
    }

    async write(data) {
        return await Util.promisify(this.port.write.bind(this.port))(data);
    }
}

module.exports = Chatpad;
