'use strict';

const Tosr0x = require('./lib/tosr0x').Tosr0x;
const relay = 1;

console.log('Locating Tosr0x controller...');
console.time('[Tosr0x]');
Tosr0x.create(null, {
	debug: true
}).then(function (ctl) {
	console.log('Controller found!');
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ctl.open();
})
.then(function (ctl) {
	console.log('Connected!!!');
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ctl.version();
})
.then(function (ret) {
	console.log('Version is ' + ret.version);
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ret.ctl.voltage();
})
.then(function (ret) {
	console.log('Voltage is ' + ret.voltage);
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ret.ctl.refreshStates();
})
.then(function (ret) {
	console.log('State', ret.states);
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ret.ctl;
})
.then(function (ctl) {
	console.log('Turning realy ' + relay + ' on');
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ctl.on(relay);
})
.then(function (ret) {
	console.log('Relay ' + relay + ' is on!!!');
	console.timeEnd('[Tosr0x]');
	return new (require('rsvp').Promise)(function (res, rej) {
		setTimeout(function () {
			console.time('[Tosr0x]');
			res(ret.ctl);
		}, 2000);
	});
})
.then(function (ctl) {
	console.log('Turning relay ' + relay + ' off');
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ctl.off(relay);
})
.then(function (ret) {
	console.log('Closing...');
	console.timeEnd('[Tosr0x]');
	console.time('[Tosr0x]');
	return ret.ctl.close();
})
.catch(function (err) {
	console.error('ERROR ' + err);
})
.finally(function () {
	console.timeEnd('[Tosr0x]');
	console.log('Exit.');
});