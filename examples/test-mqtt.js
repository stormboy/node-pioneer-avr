var avrMqtt = require("./avr-mqtt");

var options = {
    log: true,
	vsx: {
	    host: "192.168.0.9",
	    port: 23,
	},
    mqtt : {
    	host : "192.168.0.23",
    	port : 1883
    },
    mqttPaths : {
    	powerIn   : "/house/lounge/avr/power/in",
    	powerOut  : "/house/lounge/avr/power/out",
    	volumeIn  : "/house/lounge/avr/volume/in",
    	volumeOut : "/house/lounge/avr/volume/out",
    	muteIn    : "/house/lounge/avr/mute/in",
    	muteOut   : "/house/lounge/avr/mute/out",
    	sourceIn  : "/house/lounge/avr/source/in",
    	sourceOut : "/house/lounge/avr/source/out",
    }
};


var avr = new avrMqtt.AvrMqtt(options);

/*
avr.receiver.on("connect", function() {
	console.log("receiver connected");
	
	setTimeout(turnOn, 1000);
	setTimeout(function() {
		setVolume(0);
	}, 2000);
	setTimeout(function() {
		setVolume(-35);
	}, 3000);
	setTimeout(function() {
		setInput(avrMqtt.Inputs.hdmi_2);
	}, 3000);
	setTimeout(function() {
		setInput(avrMqtt.Inputs.tv_sat);
	}, 5000);
	setTimeout(turnOff, 15000);
});

function turnOn() {
	avr.receiver.power(true);
}

function turnOff() {
	avr.receiver.power(false);
}

function setVolume(db) {
	avr.receiver.volume(db);
}

function setInput(input) {
	avr.receiver.selectInput(input);
}
*/
