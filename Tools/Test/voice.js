var fs = require("fs")
var drawing = require("../../lib/drawing")
var {FFT} = require("../../lib/fft")
var audioContext = new AudioContext()
var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")
var canvasArea = new drawing.CanvasArea(canvas)

var bindArea = function(area, ctx){
    var keys = {
        drawFloatsRow: true,
        drawFloatsCol: true,
        drawBytesRow: true,
        drawBytesCol: true,
        drawByteBars: true,
        clearArea: false,
    }
    var da ={}
    for (var key in keys){
        if (keys[key]){
            da[key] = function(){
                var func = drawing[key]
                return function(data){func(data, ctx, area)}
            }();
            da["re"+key] = function(){
                var func = drawing[key]
                return function(data){
                    drawing.clearArea(ctx, area)
                    func(data, ctx, area)
                }
            }();
        }else {
            da[key] = function(){
                var func = drawing[key]
                return function(){func(ctx, area)}
            }();
        }
    }
    return da
}

var upArea = bindArea(canvasArea.getRow(2,0),ctx)
var downArea = bindArea(canvasArea.getRow(2,1),ctx)

var frameSamples = 1024
var frameStep = 441

function HammingWindow(n,a){
    var res = new Float32Array(n)
    var w = Math.PI*2/(n-1)
    for (var i=0; i<n; i++){
        res[i] = 1-a - a*Math.cos(w * i)
    }
    return res
}

function getFrames(data){
    var n = data.length
    var window = HammingWindow(frameSamples, 0.46)
    var res = []
    for (var i=0; i<n-frameSamples; i+=frameStep){
        var frame = new Float32Array(frameSamples)
        for(var j=0; j<frameSamples; j++){
            frame[j] = data[i+j] * window[j]
        }
        res.push(frame)
    }
    return res
}

var readAudioBuffer = function (filename, callback){
    var bufferLength = fs.lstatSync(filename).size
    fs.open(filename,"r", function(err,fd){
        if (err){
            console.log(err)
            return
        }
        var buf = new Buffer(bufferLength)
        //console.log(fd)
        fs.read(fd, buf, 0, bufferLength, null ,function(err, bytesRead, buffer){
            audioContext.decodeAudioData(buf.buffer,function(audioBuffer){                
                callback(audioBuffer)
            })
        })
    })
}

var myFrames
var myFramesFFT
readAudioBuffer(__dirname +"/poi.mp3",function(audioBuffer){
    var data = audioBuffer.getChannelData(0)
    myFrames = getFrames(data)

    myFramesFFT = myFrames.map(x=>FFT({real:x, imag:[]},0,1024).real.map(x=>x/1024))

})