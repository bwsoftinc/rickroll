'use strict'

const { exec, spawn } = require('child_process');
const driver = require('/home/pi/git/mlx90614/mlx90614');
const io = require('onoff').Gpio;
const q = require('/home/pi/git/rickroll/flQueue')

const mlx = new driver();
const queue = new q(12, 2.1);
const gpio = new io(23, 'out');

var proc = null;
var playing = false;

const reset = () => {
    exec('sudo rmmod i2c_arm; sudo rmmod i2c_vc', null, () => {
        exec('sudo modprobe i2c_arm; sudo modprobe i2c_vc', null, () => {
            playing = false;
        });
    });
;}

const sample = async (log) => {

    if(playing === null) {
        playing = true;
        reset();
    }

    if(!playing) {
        var val = await mlx.readObject1();
        if(log)
            console.log(val);

        playing = queue.sample(val);
        if(playing) {
            setTimeout(() => gpio.writeSync(1), 1700);
            proc = spawn('omxplayer',['--vol','800','/home/pi/git/rickroll/Rick-Astley-Never-Gonna-Give-You-Up.mp3'])
            if(log)
                console.log(proc.pid);

            proc.on('close', () => {
                exec('killall omxplayer.bin');
                gpio.writeSync(0);
                proc = null;
                playing = false;
            });
        }
    }

    setTimeout(() => sample(log), 250);
};

class rickroll {
    constructor() {
        var stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.on('data', (key) => {
            if(key == '\u0003') {
                gpio.writeSync(0);
                if(proc)
                    exec('killall omxplayer.bin');
                process.exit(1);
            }
        });

        this.start = function(log) {
            sample(log);
        }
    }
}

module.exports = rickroll;
