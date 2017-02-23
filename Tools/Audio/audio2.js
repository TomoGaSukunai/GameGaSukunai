var audioCtx = new AudioContext()
var oscillator = audioCtx.createOscillator()
var gainNode = audioCtx.createGain()



//oscillator.type = "square"
//oscillator.frequency.value = 200



gainNode.gain.value = 0.5

oscillator.connect(gainNode)
gainNode.connect(audioCtx.destination)
var real = new Float32Array(3);
var imag = new Float32Array(3);

real[0] = 0;
imag[0] = 0;
real[1] = 1;
imag[1] = 0;


var wave = audioCtx.createPeriodicWave(real, imag);
oscillator.setPeriodicWave(wave);
oscillator.start()
oscillator.stop(1)