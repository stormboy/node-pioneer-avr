var avr = require("./pioneer-avr");

var options = {
    port: 23,
    host: "192.168.0.114",
    log: true
};

var receiver = new avr.VSX(options);

receiver.on("connect", function() {
	console.log("receiver connected");
	setTimeout(turnOn, 1000);
	setTimeout(function() {
		setVolume(0);
	}, 2000);
	setTimeout(function() {
		setVolume(-35);
	}, 3000);
	setTimeout(function() {
		setInput(avr.Inputs.hdmi_2);
	}, 3000);
	setTimeout(function() {
		setInput(avr.Inputs.tv_sat);
	}, 5000);
	setTimeout(turnOff, 15000);
});

function turnOn() {
	receiver.power(true);
}

function turnOff() {
	receiver.power(false);
}

function setVolume(db) {
	receiver.volume(db);
}

function setInput(input) {
	receiver.selectInput(input);
}
