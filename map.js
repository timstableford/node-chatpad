exports.MODIFIER_SHIFT = 1;
exports.MODIFIER_GREEN = 2;
exports.MODIFIER_ORANGE = 4;
exports.MODIFIER_PEOPLE = 8;
exports.MODIFIER_CAPS = 5;

const Map = exports;

exports.MODIFIERS = {
    1: 'shift',
    2: 'green',
    4: 'orange',
    8: 'people',
    5: 'caps'
};

// For those with no ASCII codes
exports.SPECIAL = {
    0x55: 'left',
    0x51: 'right'
}

exports.KEYS = {
    // Numbers
    0x17: '1',
    0x16: '2',
    0x15: '3',
    0x14: '4',
    0x13: '5',
    0x12: '6',
    0x11: '7',
    0x67: '8',
    0x66: '9',
    0x65: '0',
    // Letters
    0x37: 'a',
    0x42: 'b',
    0x44: 'c',
    0x35: 'd',
    0x25: 'e',
    0x34: 'f',
    0x33: 'g',
    0x32: 'h',
    0x76: 'i',
    0x31: 'j',
    0x77: 'k',
    0x72: 'l',
    0x52: 'm',
    0x41: 'n',
    0x75: 'o',
    0x64: 'p',
    0x27: 'q',
    0x24: 'r',
    0x36: 's',
    0x23: 't',
    0x21: 'u',
    0x43: 'v',
    0x26: 'w',
    0x45: 'x',
    0x22: 'y',
    0x46: 'z',
    // Punctuation
    0x53: '.',
    0x62: ',',
    //Control
    0x63: '\n',
    0x71: '\b',
    0x54: ' '
};

exports.KEYS_GREEN = {
    // Letters
    0x37: '~',
    0x42: '|',
    //44: 'c',
    0x35: '{',
    0x25: '€',
    0x34: '}',
    //33: 'g',
    0x32: '/',
    0x76: '*',
    0x31: '\'',
    0x77: '[',
    0x72: ']',
    0x52: '>',
    0x41: '<',
    0x75: '(',
    0x64: ')',
    0x27: '!',
    0x24: '#',
    //36: 's',
    0x23: '%',
    0x21: '&',
    0x43: '-',
    0x26: '@',
    0x45: 'x',
    0x22: '^',
    0x46: '`',
    // Punctuation
    0x53: '?',
    0x62: ':'
};

exports.KEYS_ORANGE = {
    // Letters
    //37: 'a',
    0x42: '+',
    //44: 'c',
    //35: 'd',
    //25: 'e',
    //34: 'f',
    //33: 'g',
    0x32: '\\',
    //76: 'i',
    0x31: '"',
    //77: 'k',
    //72: 'l',
    //52: 'm',
    //41: 'n',
    //75: 'o',
    0x64: '=',
    //27: 'q',
    0x24: '$',
    //36: 's',
    //23: 't',
    //21: 'u',
    0x43: '_',
    //26: 'w',
    //45: 'x',
    //22: 'y',
    //46: 'z',
    // Punctuation
    //53: '.',
    0x62: ';'
};

exports.map = (key) => {
    switch (key.modifier) {
        case Map.MODIFIER_GREEN:
            return Map.KEYS_GREEN[key.key];
        case Map.MODIFIER_ORANGE:
            return Map.KEYS_ORANGE[key.key];
        case Map.MODIFIER_SHIFT:
            return Map.KEYS[key.key].toUpperCase() || Map.SPECIAL[key.key];
        default:
            if (key.caps) {
                return Map.KEYS[key.key].toUpperCase() || Map.SPECIAL[key.key];
            } else {
                return Map.KEYS[key.key] || Map.SPECIAL[key.key];
            }
    }
};
