'use strict';
var Tosr0x = require('./lib/tosr0x').Tosr0x;
var relay = 1;

console.time('');
Tosr0x.create().then(function (ctl) {
	console.log('Controller found!');
	console.timeEnd('');
	console.time('');
	//ctl.open(function (err, ctl) {
	return ctl.open();
})
.then(function (ctl) {
	console.log('Connected!!!');
	console.timeEnd('');
	console.time('');
	return ctl.version();
})
.then(function (ret) {
	console.log('Version is ' + ret.version);
	console.timeEnd('');
	console.time('');
	return ret.ctl.voltage();
})
.then(function (ret) {
	console.log('Voltage is ' + ret.voltage);
	console.timeEnd('');
	console.time('');
	return ret.ctl.refreshStates();
})
.then(function (ret) {
	console.log('State', ret.states);
	console.timeEnd('');
	console.time('');
	return ret.ctl;
})
.then(function (ctl) {
	console.log('Turning realy ' + relay + ' on');
	console.timeEnd('');
	console.time('');
	//ctl.on(1, function () {
	return ctl.on(relay);
})
.then(function (ret) {
	console.log('Relay ' + relay + ' is on!!!');
	console.timeEnd('');
	return new (require('rsvp').Promise)(function (res, rej) {
		setTimeout(function () {
			console.time('');
			res(ret.ctl);
		}, 2000);
	});
})
.then(function (ctl) {
	console.log('Turning relay ' + relay + ' off');
	console.timeEnd('');
	console.time('');
	return ctl.off(relay);
})
.then(function (ret) {
	console.log('Closing...');
	console.timeEnd('');
	console.time('');
	return ret.ctl.close();
})
.catch(function (err) {
	console.error('ERROR ' + err);
})
.finally(function () {
	console.timeEnd('');
	console.log('Exit.');
});