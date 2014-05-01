/**
 * To control a Pioneer receiver via IP protocol.
 * Tested with VSX-2021
 */

var util   = require('util'),
    net    = require('net'),
    events = require('events');


var TRACE = false;

/**
 * Important include host and port.
 * e.g.:
 * var options = {
 *      port: 23,
 *      host: "192.168.0.9",
 *      log: true
 *  };
 */
var VSX = function(options) {
    events.EventEmitter.call(this);            // inherit from EventEmitter
    
    this.client = this.connect(options);
    
    this.inputNames = {};
    
    TRACE = options.log;
};

util.inherits(VSX, events.EventEmitter);

VSX.prototype.connect = function(options) {
    var self = this;
    var client = net.connect(options);

    client.on("connect", function (socket) {
        handleConnection(self, socket);
    });
    
    client.on("data", function(data) {
        handleData(self, data);
     });

    client.on("end", function () {
        handleEnd(self);
    });

    client.on("error", function(err) {
        handleError(self, err);
    });

    return client;
};

/**
 * Turn unit power on or off
 */
VSX.prototype.power = function(on) {
    if (TRACE) {
        console.log("turning power: " + on);
    }
    if (on) {
        this.client.write("PO\r");
    }
    else {
        this.client.write("PF\r");
    }
};

/**
 * Turn mute on or off
 */
VSX.prototype.mute = function(on) {
    if (TRACE) {
        console.log("turning mute: " + on);
    }
    if (on) {
        this.client.write("MO\r");
    }
    else {
        this.client.write("MF\r");
    }
};

/**
 * 
 * @param {Object} db from -80 to +12
 */
VSX.prototype.volume = function(db) {
    // [0 .. 185] 1 = -80dB , 161 = 0dB, 185 = +12dB
    if (TRACE) {
        console.log("setting volume db: " + db);
    }
    var val = 0;
    if (typeof db === "undefined" || db === null) {
        val = 0;
    }
    else if (db < -80) {
        val = 0;
    }
    else if (db > 12) {
        val = 185;
    }
    else {
        val = Math.round((db * 2) + 161);
    }
    var level = val.toString();
    while (level.length < 3) {
        level = "0" + level;
    }
    if (TRACE) {
        console.log("setting volume level: " + level);
    }
    this.client.write(level + "VL\r");
};

VSX.prototype.volumeUp = function() {
    this.client.write("VU\r");
};

VSX.prototype.volumeDown = function() {
    this.client.write("VD\r");
};

/**
 * Set the input
 */
VSX.prototype.selectInput = function(input) {
    this.client.write(input + "FN\r");
};

/**
 * Set the listening mode
 */
VSX.prototype.listeningMode = function(mode) {
    this.client.write("MF\r");
};



function handleConnection(self, socket) {
    if (TRACE) {
        console.log("got connection.");
    }
    self.socket = socket;
    self.emit("connect");
}

function handleData(self, d) {
    var input;    
    var data = d.toString(); // make sure it's a string
    var length = data.lastIndexOf('\r');
    data = data.substr(0, length);

    // TODO implement a message to handler mapping instead of this big if-then statement

    if (data.startsWith("PWR")) {        // power status
        var pwr = (data == "PWR0");   // PWR0 = on, PWR1 = off
        if (TRACE) {
            console.log("got power: " + pwr);
        }
        self.emit("power", pwr);
    }
    else if (data.startsWith("VOL")) {   // volume status
        var vol = data.substr(3, 3);
        
        // translate to dB.
        var db = (parseInt(vol) - 161) / 2;
        
        if (TRACE) {
            console.log("got volume: " + db + "dB (" + vol + ")");
        }
        
        self.emit("volume", db);
    }
    else if (data.startsWith("MUT")) {   // mute status
        var mute = data.endsWith("0");  // MUT0 = muted, MUT1 = not muted
        if (TRACE) {
            console.log("got mute: " + mute);
        }
        self.emit("mute", mute);
    }
    else if (data.startsWith("FN")) {
        input = data.substr(2, 2);
        if (TRACE) {
            console.log("got Input: " + input);
        }
        self.emit("input", input);
    }
    else if (data.startsWith("SSA")) {
        // if (TRACE) {
            // console.log("got SSA: " + data);
        // }
    }
    else if (data.startsWith("APR")) {
        // if (TRACE) {
            // console.log("got APR: " + data);
        // }
    }
    else if (data.startsWith("BPR")) {
        // if (TRACE) {
            // console.log("got BPR: " + data);
        // }
    }
    else if (data.startsWith("LM")) {       // listening mode
        var mode = data.substring(2);
        if (TRACE) {
            console.log("got listening mode: " + mode);
        }
    }
    else if (data.startsWith("FL")) {       // FL display information
        // if (TRACE) {
            // console.log("got FL: " + data);
        // }
    }
    else if (data.startsWith("RGB")) {      // input name information. informs on input names
        // handle input info
        var inputId = data.substr(3, 2);
        for (input in Inputs) {
            //console.log("checking input: " + input + " whether " + Inputs[input] + " == " + inputId);
            if (Inputs[input] == inputId) {
                self.inputNames[input] = data.substr(6);
                console.log("set input " + input + " to " + self.inputNames[input]);
                // if (data.substr(5, 1) == "0") {
                    // console.log("default input name")
                // }
                break;
            }
        } 
    }
    else if (data.startsWith("RGC")) {
        // if (TRACE) {
            // console.log("got RGC: " + data);
        // }
    }
    else if (data.startsWith("RGF")) {
        // if (TRACE) {
            // console.log("got RGF: " + data);
        // }
    }
    else {
        // if (TRACE) {
            // console.log("got data: " + data);
        // }
    }
}

function handleEnd(self) {
    if (TRACE) {
        console.log("connection ended");
    }

    self.emit("end");
}

function handleError(self, err) {
    if (TRACE) {
        console.log("connection error: " + err.message);
    }

    self.emit("error", err);
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

var Inputs = {
    dvd: "04",
    bd: "25",
    tv_sat: "05",
    dvr_bdr: "15",
    video_1: "10",
    video_2: "14",
    hdmi_1: "19",
    hdmi_2: "20",
    hdmi_3: "21",
    hdmi_4: "22",
    hdmi_5: "23",
    media: "26",
    ipod_usb: "17",
    xm_radio: "18",
    cd: "01",
    cdr_tape: "03",
    tuner: "02",
    phono: "00",
    multi_ch: "12",
    adapter_port: "33",
    sirius: "27",
    hdmi_cyclic: "31",
};


exports.VSX = VSX;
exports.Inputs = Inputs;
