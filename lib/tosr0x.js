"use strict";

var sys = require('sys');
var fs = require('fs');
var _ = require('lodash');
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;
var RSVP = require('rsvp');

var call = function (callback) {
	if (!_.isFunction(callback)) {
		return;
	}
	var args = _.filter(arguments, function (arg, index) {
		return !!index;
	});

	return callback.apply(this, args);
};

var p = function (handler) {
	return new RSVP.Promise(handler);
};

var resolved = function (err, rej, callback) {
	if (!!err) {
		call(callback, err);
		rej(err);
	}
	return !err;
};

var T = exports.Tosr0x = function (uri, options) {
	this._serial = null;
	this._uri = uri || '/dev/ttyUSB0';
	this._buffer = '';
	this._options = _.assign({}, T.defaults, options || {});
	this.states = {};
	this.reads = [];
};

T.defaults = {
	// serial port specific
	baudRate: 9600,
	dataBits: 8,
	parity: 'none',
	stopBits: 1,
	flowControl: false,

	// Tosr0x specific
	debug: false,
	relayCount: 2
};

T.device = {
	vendorId: '0x0403',
	productId: '0x6001',
	moduleId: 15
};

T.portScan = function (callback) {
	return p(function (res, rej) {
		serialPort.list(function (err, ports) {
			if (resolved(err, rej)) {
				call(callback, ports);
				res(ports);
			}
		});
	});
};

T.fromPortScan = function (options, device, callback) {
	device = device || T.device;
	return p(function (res, rej) {
		T.portScan(function (ports) {
			var found = false;
			ports.forEach(function (port) {
				if (port.vendorId == device.vendorId &&
					port.productId === device.productId) {
					var t = new T(port.comName, options);
					call(callback, null, t);
					res(t);
					found = true;
				}
			});
			if (!found) {
				var err = new Error('No device found!');
				call(callback, err, null);
				rej(err);
			}
		});
	});
};

T.create = function (port, options) {
	if (!port) {
		return Tosr0x.fromPortScan(options);
	} else {
		return new Promise(function (res) {
			res(new Tosr0x(port, options));
		});
	}
};

T.commands = {
	'version'    : 'Z',
	'states'     : '[',
	'voltage'    : ']',
	'temperature': 'b',
	'on'         : 100,
	'off'        : 110
};

var bufferIsNullTerminated = function (buffer) {
	return buffer.indexOf('\n') !== -1;
};

var dataListener = function (t) {
	return function dataListener(data) {
		var newReads = [];
		console.dir(data);
		console.dir(t.reads);

		t.buffer += data.toString();

		_.forEach(t.reads, function (r) {
			var callR = function (data) {
				process.nextTick(function dataTick() {
					r(data);
				});
			};
			if (r.buffer) {
				if (!bufferIsNullTerminated(t.buffer)) {
					newReads.push(r);
				} else {
					callR(t.buffer);
				}
			} else {
				callR(data);
			}
		});

		console.dir(t.reads);
		t.reads = newReads;
		if (bufferIsNullTerminated(t.buffer)) {
			t.buffer = '';
		}

		console.dir(t.reads);
	};
};

var errorListener = function (t) {
	return function errorListener(err) {
		//t._serial = null;
		//t._state = {};
		throw err;
	};
};

var closeListener = function (t) {
	return function closeListener() {
		t._serial = null;
		t._state = {};
		t.reads = [];
		console.log('Port closed.');
	};
};

T.prototype.open = function (callback) {
	var t = this;
	var opts = _.assign({}, this._options);
	var s = new SerialPort(this._uri, opts, false);
	t._serial = null;
	t._state = {};
	return p(function open(res, rej) {
		s.open(function (err) {
			if (resolved(err, rej, callback)) {
				s.on('data', dataListener(t));
				s.on('error', errorListener(t));
				s.on('close', closeListener(t));
				t._serial = s;

				call(callback, null, t);
				res(t);
			}
		});
	});
};

T.prototype.connected = function () {
	return !!this._serial;
};

T.prototype.options = function () {
	return _.assign({}, this._options);
};

T.prototype.state = function (relay) {
	if (_.isNumber(relay)) {
		return !!this._state[relay];
	}
	return _.assign({}, this._state);
};

T.prototype.close = function (callback) {
	var t = this;
	return p(function close(res, rej) {
		if (!t._serial) {
			console.error('Already closed.');
			call(callback, null, t);
			res(t);
			return;
		}
		t._serial.flush(function (err) {
			if (resolved(err, rej, callback)) {
				t._serial.close(function (err) {
					if (resolved(err, rej, callback)) {
						call(callback, null, t);
						res(t);
					}
				});
			}
		});
	});
};

T.prototype.closeImmediate = function (callback) {
	if (!this._serial) {
		return;
	}
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
	return p(function send(res, rej) {
		console.log('------------------------------');
		console.log('Sending ' + cmd);
		s.write(cmd, function (err, bytesWritten) {
			console.log(bytesWritten + ' bytes sent');
			if (resolved(err, rej, callback)) {
				s.drain(function (err) {
					if (resolved(err, rej, callback)) {
						call(callback, bytesWritten);
						res(bytesWritten);
					}
				});
			}
		});
	});
};

T.prototype.receive = function (callback, buffer) {
	callback.buffer = buffer || false;
	this.reads.push(callback);
};

T.prototype.switch = function (relay, on, callback) {
	if (relay < 0 || relay > this._options.relayCount) {
		throw new Error('realy out of range: must be [0, ' + this._options.relayCount + ']');
	}
	this.states[relay] = !!on;
	var cmd = !!on ? T.commands.on : T.commands.off;
	return this.send(String.fromCharCode(cmd + relay), callback);
};

T.prototype.on = function (relay, callback) {
	return this.switch(relay, true, callback);
};

T.prototype.off = function (relay, callback) {
	return this.switch(relay, false, callback);
};

T.prototype.toggle = function (relay, callback) {
	return this.switch(relay, !this.states[relay], callback);
};

T.prototype.refreshStates = function (callback) {
	var t = this;
	var promise = p(function version(res, rej) {
		t.receive(function (data) {
			var binStates = data[0];
			var relayCount = t._options.relayCount;
			for (var x = 0; x < relayCount; x++) {
				var mask = (1 < x);
				t.states[relayCount - 1 - x] = (binStates & mask) === mask;
			}
			call(callback, t.states);
			res(t.states);
		});
	});
	this.send(T.commands.states);
	return promise;
};

T.prototype.version = function (callback) {
	var t = this;
	var promise = p(function version(res, rej) {
		t.receive(function (data) {
			// module should return 2-byte string:
			// module id, software version
			var v = -1;
			if (data[0] == T.device.moduleId) {
				v = data[1];
			}
			call(callback, v);
			res(v);
		});
	});
	this.send(T.commands.version);
	return promise;
};

T.prototype.voltage = function (callback) {
	var t = this;
	var promise = p(function voltage(res, rej) {
		t.receive(function (data) {
			// voltage is a byte but the value
			// is a fixed floating point with precision of 1
			var v = data[0] * 0.1;
			call(callback, v);
			res(v);
		});
	});
	this.send(T.commands.voltage);
	return promise;
};

T.prototype.temperature = function (callback) {
	var t = this;
	var promise = p(function temperature(res, rej) {
		t.receive(function (data) {
			call(callback, data);
		}, true);
	});
	this.send(T.commands.temperature);
	return promise;
};
