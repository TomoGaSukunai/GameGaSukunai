var {FFT, IFFT} = require(__dirname+"/../../lib/fft")
var drawing = require("../../lib/drawing")
var {data1,data2} =require("./data.js")
data1 = new Uint8Array(Buffer.from(data1,"base64"))
data2 = new Uint8Array(Buffer.from(data2,"base64"))

var audioContext = new AudioContext()
var amp = function (comp){
    var {real, imag} = comp
    var n = real.length/2
    var res = new Float32Array(n)
    for (var k = 0; k < n; k++){
        res[k] = Math.sqrt(real[k]*real[k] + imag[k]*imag[k])/n
    }
    return res
}

var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

var ana
var aBuffer
function stft(signal, stftSize){
    var ana = []
    for(var i=0;i<signal.real.length - stftSize;i+=stftSize){        
        ana.push(amp(FFT(signal, i, stftSize)))
    }
    var max = ana.reduce((a,b)=>Math.max(a,b.reduce((a,b)=>Math.max(a,b))),0)
    var min = ana.reduce((a,b)=>Math.min(a,b.reduce((a,b)=>Math.min(a,b))),1)
    var delta = max-min
    ana = ana.map(a=>a.map(x=>(x-min)/delta*3))
    return ana
}
var audioHandler=function(buffer){
    var rs = trim(buffer.getChannelData(0),0.1)
    aBuffer = buffer
    var signal = {
        real: rs,
        imag: new Float32Array(rs.length)
    }
    var stftSize = 512
    ana = stft(signal, stftSize)


    for(var i=0;i<ana.length;i++){
        var data = ana[i]
        drawing.drawFloatsCol(data, ctx, {x:i/ana.length * canvas.width,y:0,w:canvas.width/ana.length,h:canvas.height})
    }
    for(var i=0;i<stftSize/2;i++){
        var data = ana.map(a=>a[i])
        drawing.drawFloatsRow(data, ctx, {x:0, y:i/stftSize*2 * canvas.height,h:canvas.height/stftSize*2,w:canvas.width})
    }

    //draw2DColor(ana,ctx,{x:0,y:0,w:canvas.width,h:canvas.height})
}

function draw2DColor(data, ctx, area){
    var dx = area.w / data.length
    var dy = area.h / data[0].length
    
    for (var i=0; i<data.length; i++){
        var line = data[i]
        for(var j=0; j<line.length; j++){
            ctx.beginPath()
            ctx.rect(area.x+dx * i-0.5, area.y+dy * j -0.5,dx+1,dy+1)
            ctx.fillStyle = getStyle(line[j])
            ctx.fill()
        }        
    }
}
function getStyle(x){
    if (x < 1 )
        return "rgb(128,"+Math.floor(128+x*128)+",128)"
    else if (x < 2)
        return "rgb("+Math.floor(x*128)+",255,128)"
    else 
        return "rgb(255,"+Math.floor((4-x)*128)+",128)"
}
var colorTest = []
for(var i=0; i<128; i++){
    var line = []
    for(var j=0; j<128; j++){
        line.push((i+j)*3/256)
    }
    colorTest.push(line)
}
area = {x:0,y:0,w:canvas.width,h:canvas.height}
function holeArea(){
    return {x:0,y:0,w:canvas.width,h:canvas.height}
}
//draw2DColor(colorTest, ctx, area)
//audioContext.decodeAudioData(data2.buffer,audioHandler)
var fs = require("fs")
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
readAudioBuffer(__dirname+"/poi.mp3",audioHandler)
function trim(signal, percent){
    var max = signal.reduce((a,b)=>Math.max(a,b))
    var head = 0, tail = signal.length
    for (;head<tail;head++){
        if(signal[head] > max * percent/100){
            break
        }
    }
    for (;head<tail;tail--){
        if(signal[tail] > max * percent/100){
            break
        }
    }
    return signal.slice(head - 1,tail-head+2)
}
function playData(data){

    var buffer = audioContext.createBuffer(1,data.length,audioContext.sampleRate)
    var signal = buffer.getChannelData(0)
    for (var i=0;i<data.length;i++){
        signal[i] = data[i]
    }
    var s = audioContext.createBufferSource()
    s.buffer = buffer
    s.connect(audioContext.destination)
    s.onended = function(){
        s.disconnect(audioContext.destination)
    }
    s.start()
}