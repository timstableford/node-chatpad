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

    //await pad.close();
})();
