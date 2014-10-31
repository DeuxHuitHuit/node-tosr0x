# node tosr0x

> A nodejs lib for controlling a [tosr0x board](http://www.tinyosshop.com/index.php?route=product/product&product_id=365) via USB port.

## Installation

```
npm i tosr0x --save
```

## Requirements

- node v0.10+
- A Tosr0x USB board from [TinySine](http://www.tinyosshop.com/) (TOSR02, TOSR04, TOSR08)
- Being able to compile [serial port](https://github.com/voodootikigod/node-serialport#to-install)

## Usage

Usage is pretty strait foward: You either create a `Tosr0x` instance or request one.

```js
var Tosr0x = require('tosr0x').Tosr0x;
// when you know the usb port uri
var board = new Tosr0x(uri);
// when you do not know it
Tosr0x.fromPortScan().then(function (board) {});
// when you get input from a random variable that might be empty
// hit: this ALWAYS returns a Promise :)
Tosr0x.create(uri).then(function (board) {});
```

### Promise usage

The api is 99% built on promises but most method also accepts callbacks. The promise implementation currently used is [rsvp.js](https://github.com/tildeio/rsvp.js).

## API

### Tosr0x(uri, [options]);

### Static methods

#### Tosr0x.fromPortScan([options,] [device,] [callback]) returns Promise

#### Tosr0x.create([uri,] [options]) returns Promise

### Static members

#### Tosr0x.defaults {}

#### Tosr0x.device {}

#### Tosr0x.commands {}

### Instance methods

#### .open([callback]) returns Promise

#### .connected() returns boolean

#### .options() returns {}

#### .state([relay]) returns {}

#### .close([callback]) returns Promise

#### .closeImmediate([callback]) returns undefined

#### .send(cmd, [callback]) returns Promise

#### .receive(callback, [buffer]) returns undefined

#### .switch(relay, on, [callback]) returns Promise

#### .on(relay, [callback]) returns Promise

#### .off(relay, [callback]) returns Promise

#### .toggle(relay, [callback]) returns Promise

#### .states([callback]) returns Promise
#### .refreshStates([callback]) returns Promise

#### .version([callback]) returns Promise

#### .voltage([callback]) returns Promise

#### .temperature([callback]) returns Promise


## Inspiration/References

- <http://jimter.net/controlling-a-tosr0x-usb-relay-module-using-python/>
- <https://github.com/amorphic/tosr0x>
- <https://github.com/jlopex/relay-remote-ctrl>

## Credits

Made with love in Montréal by <https://deuxhuithuit.com>

Licensed under the MIT License: <http://deuxhuithuit.mit-license.org>

