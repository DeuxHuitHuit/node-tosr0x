var sys = require('sys');
var fs = require('fs');
var _ = require('lodash');
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;

var T = exports.Tosr0x = function (uri, options) {
	this._serial = null;
	this._uri = uri || '/dev/ttyUSB0';
	this._options = _.assing(options, {
		baudRate: 9600,
		dataBits: 8,
		parity: 'none',
		stopBits: 1,
		flowControl: false,
		debug: false
	});
	this.state = {};
};

T.portScan = function (callback) {
	serialPort.list(function (err, ports) {
		if (!!err) {
			throw err;
		}
		ports.forEach(function (port) {
			console.log(port);
			callback(port);
		});
	});
};

T.fromPortScan = function () {
	T.portScan(function (port) {

	});
};

T.prototype.open = function (callback) {
	var t = this;
	var s = new SerialPort(this._uri, this._options, false);
	s.open(function (err) {
		if (!!err) {
			t._serial = null;
			t._state = {};
			throw err;
		}
		t._serial = s;
		callback(t);
	});
};

T.prototype.connected = function () {
	return !!this._serial;
};

T.prototype.close = function (callback) {
	this._serial.close(callback);
	t._serial = null;
	t._state = {};
};

T.prototype.send = function (payload, callback) {
	if (!this._serial) {
		throw new Error('Not connected.');
	}
	this._serial.write(String.fromCharCode(dec), function (err, bytesWritten) {

	});
};

T.prototype.on = function (relay, callback) {
	this.state[relay] = true;
};

T.prototype.off = function (relay, callback) {
	this.state[relay] = false;
};
