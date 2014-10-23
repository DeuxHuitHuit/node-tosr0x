var sys = require('sys');
var fs = require('fs');
var _ = require('lodash');
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;

var T = exports.Tosr0x = function (uri, options) {
	this._serial = null;
	this._uri = uri || '/dev/ttyUSB0';
	this._buffer = '';
	this._options = _.assign(options, T.defaults);
	this.states = {};
	this.reads = [];
};

T.defaults = {
	baudRate: 9600,
	dataBits: 8,
	parity: 'none',
	stopBits: 1,
	flowControl: false,
	debug: false
};

T.device = {
	vendorId: '0x0403',
	productId: '0x6001' 
};

T.portScan = function (callback) {
	serialPort.list(function (err, ports) {
		if (!!err) {
			throw err;
		}
		ports.forEach(function (port) {
			if (port.vendorId == T.device.vendorId &&
				port.productId === T.device.productId) {
				callback(new T(port.comName));
			}
		});
	});
};

T.commands = {
	'version'    : 'Z',
	'states'     : '[',
	'voltage'    : ']',
	'temperature': 'b',
	'on'         : 100,
	'off'        : 110
};

var dataListener = function (t) {
	return function (data) {
		var newReads = [];
		_.forEach(t.reads, function (r) {
			if (r.buffer) {
				t.buffer += data.toString();
				newReads.push(r);
			} else {
				r(data);
			}
		});
		t.reads = newReads;
	};
};

var errorListener = function (t) {
	return function (err) {
		t._serial = null;
		t._state = {};
		console.log(err);
	};
};

var closeListener = function (t) {
	return function () {
		t._serial = null;
		t._state = {};
		console.log('Port closed.');
	};
};

T.prototype.open = function (callback) {
	var t = this;
	var s = new SerialPort(this._uri, this._options, false);
	t._serial = null;
	t._state = {};
	s.open(function (err) {
		if (!!err) {
			throw err;
		}
		s.on('data', dataListener(t));
		s.on('error', errorListener(t));
		s.on('close', closeListener(t));
		t._serial = s;
		callback(t);
	});
};

T.prototype.connected = function () {
	return !!this._serial;
};

T.prototype.close = function (callback) {
	this._serial.close(callback);
};

T.prototype.send = function (cmd, callback) {
	if (!this._serial) {
		throw new Error('Not connected.');
	}
	if (cmd.length !== 1) {
		throw new Error('cmd must be one ascii char');
	}
	var s = this._serial;
	s.write(cmd, function (err, bytesWritten) {
		console.log(bytesWritten);
		if (err) {
			throw err;
		}
		s.drain(callback || _.noop);
	});
};

T.prototype.receive = function (callback, buffer) {
	callback.buffer = buffer || false;
	this.reads.push(callback);
};

T.prototype.on = function (relay, callback) {
	this.states[relay] = true;
	this.send(String.fromCharCode(T.commands.on + relay), callback);
};

T.prototype.off = function (relay, callback) {
	this.states[relay] = false;
	this.send(String.fromCharCode(T.commands.off + relay), callback);
};

T.prototype.switch = function (relay, callback) {
	this[!this.states[relay] ? 'on' : 'off'](relay, callback);
};

T.prototype.refreshStates = function (callback) {
	this.receive(function (data) {
		// ... ?
		callback(data);
	});
	this.send(T.commands.states);
};

T.prototype.version = function (callback) {
	this.receive(callback);
	this.send(T.commands.version);
};

T.prototype.voltage = function (callback) {
	this.receive(callback);
	this.send(T.commands.voltage);
};

T.prototype.temperature = function (callback) {
	this.receive(callback);
	this.send(T.commands.temperature);
};