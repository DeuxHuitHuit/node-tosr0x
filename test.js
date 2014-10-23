var Tosr0x = require('./lib/tosr0x').Tosr0x;

Tosr0x.portScan(function (ctl) {
	console.log('Controller found!');
	ctl.open(function (ctl) {
		console.log('Connected!!!');
		ctl.version(function (version) {
			console.log('Version is ' + version);

			ctl.refreshStates(function (states) {
				console.dir(states);
				ctl.close();
			});

			/*console.log('Turning realy 1 on');
			ctl.on(1, function () {
				console.log('Relay one is on!!!');
				setTimeout(function () {
					ctl.off(1, function () {
						console.log('Relay one is off!!!');
						ctl.close();
					});
				}, 2000);
			});*/
		});
	});
});