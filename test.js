var Tosr0x = require('./lib/tosr0x').Tosr0x;

var ctl;

//Tosr0x.fromPortScan(null, function (err, ctl) {
Tosr0x.fromPortScan().then(function (c) {
	ctl = c;
	console.log('Controller found!');
	//ctl.open(function (err, ctl) {
	return ctl.open();
})
.then(function (ctl) {
	console.log('Connected!!!');
	return ctl.version();
})
.then(function (version) {
	console.log('Version is ' + version);
	return ctl.refreshStates();
})
.then(function (states) {
	console.log('State', states);
})
.then(function () {
	console.log('Turning realy 1 on');
	//ctl.on(1, function () {
	return ctl.on(0);
})
.then(function () {
	console.log('Relay one is on!!!');
	return new (require('rsvp').Promise)(function (res, rej) {
		setTimeout(function () {
			res();
		}, 2000);
	});
})
.then(function () {
	return ctl.off(0);
})
.then(function () {
	return ctl.close();
})
.catch(function (err) {
	console.error('ERROR ' + err);
})
.finally(function () {
	if (!!ctl) {
		ctl.closeImmediate();
	}
	console.log('Exit.');
});