var Tosr0x = require('./lib/tosr0x').Tosr0x;

Tosr0x.portScan(function () {
	
});

var ctl = new Tosr0x();

ctl.open(function (ctl) {
	ctl.version(function (data) {
		console.log('Version is ' + data);
		console.log('Turning realy 1 on');
		ctl.on(1, function () {
			console.log('Relay one is on!!!');
			ctl.close();
		});
	});
});