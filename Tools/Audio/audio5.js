var auCtx = new AudioContext()
var analyser = auCtx.createAnalyser()
var proccesr = auCtx.createScriptProcessor(1024, 1, 1)
var source1 = auCtx.createOscillator()
source1.frequency.value = 440 * 1.5
//source1.type = "square"
var source2 = auCtx.createOscillator()
source2.frequency.value = 440 * 1.75
//source2.type = "square"
var gain = auCtx.createGain()
gain.gain.value = 0.2

var gain2 = auCtx.createGain()
gain2.gain.value = 0.01
var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

var drawData = require("./audio-works").DrawArray
var Areas = [
    {x: 0, y: 0, w: 640, h: 120},
    {x: 0, y: 120, w: 640, h: 120},
    {x: 0, y: 240, w: 640, h: 120},
    {x: 0, y: 360, w: 640, h: 120},    
]

source1.connect(gain)
source2.connect(gain)
gain.connect(analyser)
analyser.connect(proccesr)
proccesr.connect(gain2)
gain2.connect(auCtx.destination)
analyser.fftSize = 2048
var floatTime = new Float32Array(analyser.frequencyBinCount)
var floatFreq = new Float32Array(analyser.frequencyBinCount)

source1.start(1)
source2.start(1)

proccesr.onaudioprocess = function(e){
    analyser.getFloatFrequencyData(floatFreq)
    analyser.getFloatTimeDomainData(floatTime)
    //auCtx.suspend().then(function(){ })
    var inputBuffer = e.inputBuffer
    var outputBuffer = e.outputBuffer
    var inputData = inputBuffer.getChannelData(0)
    var outputData = outputBuffer.getChannelData(0)
    for(var i=0; i<inputBuffer.length; i++){
        outputData[i] = inputData[i]
    }
    drawData(floatFreq.slice(0).map(x=>(x+200)/200), ctx, Areas[0])
    drawData(floatTime, ctx, Areas[2])
    //drawData(inputData, ctx, Areas[3])
}



let status = false
canvas.onclick = function(){
    if (status) 
        auCtx.suspend().then(()=>{status = false})
    else
        auCtx.resume().then(()=>{status = true})
}



var fs = require("fs")
var data = new Uint8Array(Buffer.from(fs.readFileSync("./tools/audio/data1.base64","UTF-8"),"base64"))

 auCtx.decodeAudioData(data.buffer,function(buffer){
     var source = auCtx.createBufferSource()
     source.buffer = buffer
     source.loop = true
     source.connect(gain)
     source.start()
 })

