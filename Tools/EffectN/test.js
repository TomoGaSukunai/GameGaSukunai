var {FFT, IFFT, Amplitude} = require(__dirname+"/../../lib/fft")
var drawing = require("../../lib/drawing")
var {data1,data2} =require("./data.js")
data1 = new Uint8Array(Buffer.from(data1,"base64"))
data2 = new Uint8Array(Buffer.from(data2,"base64"))

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
    da["draw2DColor"] = function(data){
        draw2DColor(data,ctx,area)
    }
    return da
}

var upArea = bindArea(canvasArea.getRow(2,0),ctx)
var downArea = bindArea(canvasArea.getRow(2,1),ctx)

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
function HammingWindow(n,a){
    var res = new Float32Array(n)
    var w = Math.PI*2/(n-1)
    for (var i=0; i<n; i++){
        res[i] = 1 - a - a*Math.cos(w * i)
    }
    return res
}
function getEngergy(data){
    var n = data.length
    var e = data.reduce((a,b)=>a+b*b,0)
    return e/n
}
function getFrames(sig, step, win){
    var len = win.length
    var n = sig.length
    var ret = []    
    for (var i=0; i<n-len; i+=step){
        ret.push(win.map((x,ii)=>x*sig[i + ii]))
    }
    return ret
}

var step = 128
var len = 128
var minE = 1e-8
var hamWin = HammingWindow(len,0.46)
var rectWin = hamWin.map(x=>1);
var sig

var hamSigs
var recSigs

var hamEng
var recEng

audioContext.decodeAudioData(data1.buffer,function(buff){    
    
    sig = buff.getChannelData(0)
    
    //framing
    hamSigs = getFrames(sig, step, hamWin)
    recSigs = getFrames(sig, step, rectWin)

    //get energy-time curve from framing
    hamEng = hamSigs.map(x=>getEngergy(x))//.map(x=>Math.log(x)/20)
    recEng = recSigs.map(x=>getEngergy(x))//.map(x=>Math.log(x)/20)

    //origin energy-time curve
    //downArea.drawFloatsRow(recEng)
    
    //smoothed energy-time curve with dct
    smoothed = smoothen(recEng,36)
    //ctx.strokeStyle = "rgb(255,128,128)"
    //downArea.drawFloatsRow(smoothed)
    //upArea.drawFloatsRow(smoothed)
    
    // ADSR model to approach the origin curve
    myADSR = new ADSR (0.008, 0.017, 0.05, 0.05, 0.425, 0.2)
    adsrSeq = myADSR.seq(recEng.length, buff.duration)
    //ctx.strokeStyle = "rgb(128,255,255)"
    //downArea.drawFloatsRow(adsrSeq)

    diff = adsrSeq.map((x,i)=>x - recEng[i])

    // fft on frames
    amps = hamSigs.map(x=> Amplitude(FFT({real:x,imag:[]},0,len)))

    //freq - time 
    ctx.strokeStyle = "rgb(128,128,128)"
    amps.map((x,i)=>drawing.drawFloatsRow(x.map(y=>y*4),ctx,canvasArea.getRow(amps.length,i)))

    //find domain freq of frame with mean 
    means = amps.map(x=>getMeanIndex(x, 0.01))

    //
    ctx.beginPath()
    means.map((a,i)=>ctx.lineTo(a/len*2*canvas.width,(i+0.5)/amps.length*canvas.height))
    ctx.stroke()


})

// centerify mean by ignore freq dist < max * ptg
function getMeanIndex(data, ptg = 0){
    var mm = data.reduce((a,b)=>Math.max(a,b)) * ptg
    var nn = data.reduce((a,b)=>b>mm?a+b:a,0)
    var ee = data.reduce((a,b,i)=>b>mm?a+b*i:a,0)
    return ee/nn
}

function smoothen(sig, remain){
    var dct = DCT(sig)
    var dct = dct.map((x,i)=>i>remain?0:x)
    return IDCT(dct)
}

function DCT(sig){
    var n = sig.length
    var ret = new Float32Array(n)    
    var tic = Math.PI/n/2
    for (var i=0; i<n; i++){
        for(var j=0; j<n; j++){
            var k = j*(2*i+1)
            ret[j] += sig[i]*Math.cos(k*tic)
        }
    }
    //orthogonalization
    ret[0] *= Math.SQRT1_2
    var sqrtN = Math.sqrt(2/n)
    for (var j=0; j<n; j++){
        ret[j] *= sqrtN
    }    
    return ret
}

function IDCT(sig){
    var n = sig.length
    var ret = new Float32Array(n)
    var sqrtN = Math.sqrt(2/n)
    var tic = Math.PI/n/2
    //for orthogonalizated
    for (var j=0; j<n; j++){        
        ret[j] = sig[0]*Math.SQRT1_2
    }
    for (var i=1; i<n; i++){
        for(var j=0; j<n; j++){
            var k = i*(2*j+1)
            ret[j] += sig[i]*Math.cos(k*tic)
        }
    }    
    //orthogonalization
    var sqrtN = Math.sqrt(2/n)
    for (var j=0; j<n; j++){
        ret[j] *= sqrtN
    }
    return ret
}

function ADSR(attack, decay, sustain, release, peak, hold){
    this.f = [
        // during attack, mag increases from 0 to peak
        (t) => t/attack * peak,
        // during decay, mag falls from peak to hold    
        (t) => peak - t/decay * (peak - hold),
        // during sustain, mag hold on hold
        (t) => hold,
        // during release, mag falls from hold to 0
        (t) => (1 - t/release) * hold,
        // a func to cover t > duration
        (t) => 0,
    ]
    this.dt = [attack, decay, sustain, release]
    this.ft = [...this.dt, Infinity]
    this.duration = this.ft.reduce((a,b)=>a+b)
    this.seq = function(n, t){
        var dt = t/(n-1)
        var nt = 0
        var idx = 0
        var ret = new Float32Array(n)
        for(var i=0; i<n ; i++){            
            for( ;nt > this.ft[idx];idx++){
                nt -= this.ft[idx]                
            }
            ret[i] = this.f[idx](nt)
            nt += dt
        }
        return ret
    }
}