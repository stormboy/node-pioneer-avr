var avr = require("../pioneer-avr");

var options = {
    port: 8102,
    host: "192.168.0.9",
    log: true
};

var receiver = new avr.VSX(options);

receiver.on("connect", function() {
	console.log("receiver connected");
	
	// turn on the receiver in 1 secons
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
	
	setTimeout(turnOff, 8000);
	
	setTimeout(turnOn, 15000);
});

receiver.on("input", function(id, name) {
	console.log("current input: " + id + " : " + name);
});

receiver.on("inputName", function(id, name) {
	console.log("got input name: " + id + " : " + name);
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
