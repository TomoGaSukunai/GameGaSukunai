var auCtx = new AudioContext()
var  data1 = "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+CxIoeohS2hrKnVmMf/zosROQKwN+ABj3twiGMTEI6EhQIjwB0YzEnkOTxpP1bFgsSujn6dLYcyqYYcBRT1gp1QthyuEM5XA5lVbd2GZiZstyqP1msrn6GzWxtTOaGuCecxul5J8dLChrpXK6N1NNaE+TxpLs0VCnnI/UJxKrYrEy1gsLipkOfXTzNaz6GhsR9q1mKOoYE+oKtblFvLChsROsvbVa1K58noieZswYv/+LZonlUfrQnVk5lphVsSNWDhtUMBPM28sSungssWtTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//OgxAAAAANIAAAAAExBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=="


var s1 = auCtx.createBufferSource()

var dataArray = new Uint8Array(Buffer.from(data1.replace(/^data:audio\/\w+;base64,/, ""),"base64"))
var sb
var analyser = auCtx.createAnalyser()

analyser.connect(auCtx.destination)

auCtx.decodeAudioData(dataArray.buffer, function(buffer){
    sb = buffer
},function(e){
    console.log(e)
})

analyser.fftSize = 256
var bufferLength = analyser.frequencyBinCount
var res = new Uint8Array(bufferLength)

var canvas = document.getElementById("gaming");
var canvasCtx = canvas.getContext("2d");

function draw() {

  drawVisual = requestAnimationFrame(draw);

  analyser.getByteTimeDomainData(res);

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  canvasCtx.beginPath();

  var sliceWidth = canvas.width * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {

    var v = res[i] / 128.0;
    var y = v * canvas.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
};
draw()

var silentArrray = auCtx.createBuffer(1,bufferLength,auCtx.sampleRate)

function play(buffer, delay = 0){
    var s = auCtx.createBufferSource()
    s.buffer = buffer
    s.connect(analyser)
    s.start(auCtx.currentTime+ delay)
    s.onended=()=>{
        s.disconnect(analyser)
    }
}

canvas.onclick = function(){
    play(sb)
}


function playSine(Freq, time){
    var osi = auCtx.createOscillator()
    osi.frequency.value = Freq
    osi.type = "sine"
    osi.connect(analyser)
    osi.start()
    osi.stop(auCtx.currentTime + time)
}
var real = new Float32Array(3);
var imag = new Float32Array(3);

real[0] = 0;
imag[0] = 0;
real[1] = 1;
imag[1] = 0;


function playPeriod(real, imag){
    var osi = auCtx.createOscillator()
    var wave = auCtx.createPeriodicWave(real, imag);
    osi.setPeriodicWave(wave);
    osi.connect(analyser)
    osi.start()
    osi.stop(auCtx.currentTime+1)
    console.log(osi.frequency)
}