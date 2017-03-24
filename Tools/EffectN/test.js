var {FFT, IFFT, Amplitude} = require(__dirname+"/../../lib/fft")
var drawing = require("../../lib/drawing")
var {data1,data2} =require("./data.js")
data1 = new Uint8Array(Buffer.from(data1,"base64"))
data2 = new Uint8Array(Buffer.from(data2,"base64"))

var audioContext = new AudioContext()

var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

var canvasArea = new drawing.CanvasArea(canvas)
var holeArea = bindArea(canvasArea.getHoleArea(), ctx)
var upArea = bindArea(canvasArea.getRow(2,0), ctx)
var downArea = bindArea(canvasArea.getRow(2,1), ctx)

function bindArea(area, ctx){
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
    var p = 1.0/2.0
    var a = hold /Math.pow(release,p)

    this.f = [
        // during attack, mag increases from 0 to peak
        (t) => t/attack * peak,
        // during decay, mag falls from peak to hold    
        (t) => peak - t/decay * (peak - hold),
        // during sustain, mag hold on hold
        (t) => hold,
        // during release, mag falls from hold to 0
        (t) => - a * Math.pow(t,p) + hold,
        // a func to cover t > duration
        (t) => 0,
    ]
    this.dt = [attack, decay, sustain, release]
    this.ft = [attack, decay, sustain, release, Infinity]
    this.duration = this.dt.reduce((a,b)=>a+b)
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

function getTFDrawer(nframes){
    return function drawTF(tf){
        ctx.beginPath()    
        for (var p of tf){
            ctx.lineTo(p.f/audioContext.sampleRate*2*canvas.width,
            p.t*audioContext.sampleRate/len/nframes*canvas.height)
        }
        ctx.stroke()
    }
}

function energySignal(frames){    
    // get energy-time curve from framing
    energies = frames.map(x=>getEngergy(x))    
    
    // origin energy-time curve
    downArea.drawFloatsRow(energies)
    
    // smoothed energy-time curve with dct
    var smoothed = smoothen(energies,36)
    ctx.strokeStyle = "rgb(255,128,128)"
    downArea.drawFloatsRow(smoothed)
    upArea.drawFloatsRow(smoothed)

    //diff = adsrSeq.map((x,i)=>x - recEng[i])
}
function energyADSR(adsr, n = __nf, duration = __ds){
    var adsrSeq = adsr.seq(n, duration)
    ctx.strokeStyle = "rgb(128,255,255)"
    downArea.drawFloatsRow(adsrSeq)
    upArea.drawFloatsRow(adsrSeq)
}
function timeFreqSignal(frames){
    // fft on frames
    var amps = frames.map(x=> Amplitude(FFT({real:x,imag:[]},0,len)))

    // freq - time
    ctx.strokeStyle = "rgb(128,128,128)"
    amps.map((x,i)=>
        drawing.drawFloatsRow(x.map(y=>y*4),ctx,canvasArea.getRow(amps.length,i))
    )

    //find domain freq of frame with mean 
    var means = amps.map(x=>getMeanIndex(x, 0.1)*audioContext.sampleRate/len)

    var tf_curve = []
    var dt = len/audioContext.sampleRate
    for (var i=0; i<means.length; i++){
        tf_curve.push({t:dt*(i+0.5),f:means[i]})
    }
    ctx.strokeStyle = "#00eeee"
    getTFDrawer(frames.length)(tf_curve)

}
function timeFreqCurve(curve, n = __nf, duration = __ds){
    var tf_curve = []
    for(var t=0; t<duration; t+=0.0001){
       f = curve(t)
       tf_curve.push({t,f})
    }
    ctx.strokeStyle = "#ee00ee"
    getTFDrawer(n)(tf_curve)
}
function createEffect(adsr, curve){
    var nn = adsr.duration * audioContext.sampleRate
    var effect = new Float32Array(nn)
    var envlope = adsr.seq(nn,adsr.duration)
    var dt = 1 / audioContext.sampleRate
    var phase = 0
    for (var i=0; i<nn; i++){
        var t = dt * i
        var f = curve(t)
        phase = phase + dt*f*2*Math.PI
        effect[i] = Math.sqrt(envlope[i]) * Math.sin(phase) * Math.SQRT2        
    }    
    return effect
}
function energyAnalysis(sig, adsr){  
    // framing
    var frames = getFrames(sig, step, rectWin)
    energySignal(frames)
    __nf = frames.length
    __ds = sig.length/audioContext.sampleRate
    // ADSR model to approach the origin curve
    //var adsr = new ADSR (0.008, 0.017, 0.05, 0.05, 0.425, 0.2)    
    if (adsr !== undefined)
        energyADSR(adsr, frames.length, sig.length / audioContext.sampleRate)
}

function timeFreqAnalysis(sig, curve){
    // framing
    var frames = getFrames(sig, step, hamWin)
    timeFreqSignal(frames)
    __nf = frames.length
    __ds = sig.length/audioContext.sampleRate
    // An x3 model to approach the origin curve    
    //var curve = (x)=> x > 0.0875? 1480*2:2*1624070*x*x*x+392*2
    if (curve !== undefined)
        timeFreqCurve(curve, frames.length, sig.length / audioContext.sampleRate)
}


function analysisPlan(analysis, para){
    return function plan(buff){
        sig = buff.getChannelData(0)
        analysis(sig, para)
    }
}


var step = 128
var len = 128
var minE = 1e-8
var hamWin = HammingWindow(len,0.46)
var rectWin = hamWin.map(x=>1);
var sig1
var sig2
var __nf = 0
var __ds = 0

var createCurve = (f1,f2,t)=>{
    var a = (f2-f1)/t/t/t
    return (x)=> x > t ?f2 :f1 + a*x*x*x
}
//my effect approach from data
//var myCurve1 = (x)=> x > 0.0875? 3000:3313834*x*x*x+750
var myCurve1 = createCurve(750, 3000, 0.0875)
var myADSR1 = new ADSR (0.008, 0.017, 0.055, 0.05, 0.425, 0.2)
var myEffect1 = createEffect(myADSR1, myCurve1)
//playData(myEffect1)

var myADSR2 = new ADSR(0.008, 0.017, 0.07, 0.07, 0.425, 0.325)
//var myCurve2 = (x)=> x > 0.075? 3136: 5223514*x*x*x+932.33
var myCurve2 = createCurve(960, 3100, 0.075)
var myEffect2 = createEffect(myADSR2, myCurve2)
//playData(myEffect2)

audioContext.decodeAudioData(data1.buffer, function(buff){
    sig1 = buff.getChannelData(0)
    //energyAnalysis(sig1, myADSR1)
    //timeFreqAnalysis(sig1, myCurve1)

    //compareSig(sig1, myEffect1, 4000, 5000)
})
audioContext.decodeAudioData(data2.buffer, function(buff){
    sig2 = buff.getChannelData(0)
    //energyAnalysis(sig2, myADSR2)
    timeFreqAnalysis(sig2, myCurve2)
})
//
// audioContext.decodeAudioData(data1.buffer,analysisPlan(timeFreqAnalysis))

function compareSig(s1, s2, s, e){
    ctx.strokeStyle = "#006600"
    holeArea.redrawFloatsRow(s1.slice(s,e))
    ctx.strokeStyle = "#660000"
    holeArea.drawFloatsRow(s2.slice(s,e))
}

