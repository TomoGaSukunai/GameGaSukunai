var fft = require(__dirname+"/../../lib/fft")
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


var ana =[]
audioContext.decodeAudioData(data2.buffer,function(buffer){
    var rs = buffer.getChannelData(0)
    var signal = {
        real: rs,
        imag: new Float32Array(rs.length)
    }
    
    var analysis_length = 1024
    var analysis_step = 256

    for(var i=0;i<rs.length - analysis_length;i+=analysis_step){        
        ana.push(amp(fft(signal, i, analysis_length)))
    }
    var max = ana.reduce((a,b)=>Math.max(a,b.reduce((a,b)=>Math.max(a,b))),0)
    var min = ana.reduce((a,b)=>Math.min(a,b.reduce((a,b)=>Math.min(a,b))),1)
    var delta = max-min
    ana = ana.map(a=>a.map(x=>(x-min)/delta*3))
    for(var i=0;i<ana.length;i++){
        var data = ana[i]
        drawArray(data, ctx, {x:0, y:i/ana.length * canvas.height,h:canvas.height/ana.length,w:canvas.width})
    }
})

function drawArray(data, ctx, area){
    ctx.clearRect(area.x, area.y, area.w, area.h)
    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i=0; i<data.length; i++){        
        ctx.lineTo(area.x + i/data.length*area.w, area.y + area.h/2*(1 - data[i]))        
    }
    ctx.stroke()
}