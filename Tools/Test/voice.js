var fs = require("fs")
var drawing = require("../../lib/drawing")
var {FFT, IFFT, Amplitude} = require("../../lib/fft")
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

var data
var dataFiltered
var myFrames
var myFramesFFT
var myFramesFFTA
var myFramesMF
var myFramesMFL
var myFramesMFCC



var mfccHandler = function(callback){
    return function(audioBuffer){
        data = audioBuffer.getChannelData(0)
        dataFiltered = myFilter([1,-0.98], [1], data)//.map(x=>x*5)
        myFrames = getFrames(dataFiltered)
        //myFramesFFT = myFrames.map(x=>FFT({real:x, imag:[]},0,1024).real.map(x=>x/1024))
        myFramesFFTA = myFrames.map(x=>Amplitude(FFT({real:x, imag:[]},0,1024)))
        myFramesMF = myFramesFFTA.map(x=>melFilter(32,x,300,3000))
        myFramesMFL = myFramesMF.map(x=>x.map(y=>Math.log(y)/10))
        myFramesMFCC = myFramesMFL.map(x=>DCT(x).slice(1,13))
        callback()
    }
}


var sec1 = {}
var poi = {}
var mp3s = ["082-ConstComplete.mp3",
            "082-DockMedDmg.mp3",
            "082-Return.mp3",
            "082-Sec1.mp3",
            "082-Sec3.mp3",
            "144-Atk2.mp3",]

var imp3 = 4
var si = (imp3 == 4 ?2:0)
readAudioBuffer(__dirname +"/"+mp3s[imp3],mfccHandler(function(){
    upArea.draw2DColor(myFramesMFCC)
    upArea.drawFloatsRow(myFrames.map(x=>frameEnergy(x)).map(x=>x>0?Math.log(x)/50:-0.95))
    myFramesMFCC.map((x,i)=>drawing.drawFloatsCol(x,ctx,canvasArea.getSubArea(myFramesMFCC.length,2,i,0)))
    sec1.MFCC = myFramesMFCC
    sec1.energy = myFrames.map(x=>frameEnergy(x))
    dtw()
}))
readAudioBuffer(__dirname +"/poi.mp3",mfccHandler(function(){
    downArea.draw2DColor(myFramesMFCC)
    downArea.drawFloatsRow(myFrames.map(x=>frameEnergy(x)).map(x=>x>0?Math.log(x)/50:-0.95))
    myFramesMFCC.map((x,i)=>drawing.drawFloatsCol(x,ctx,canvasArea.getSubArea(myFramesMFCC.length,2,i,1)))
    poi.MFCC = myFramesMFCC
    poi.energy = myFrames.map(x=>frameEnergy(x))
    dtw()
}))

function myFilter(B,A,X){
    var Y = new Float32Array(X.length)
    for(var i=X.length-1; i>=0; i--){
        var sumA = 0
        var sumB = 0
        for (var j=1; j<A.length; j++){
            sumA += A[j] * (Y[i-j] || 0)
        }
        for(var j=0; j<B.length; j++){
            sumB += B[j] * (X[i-j] || 0)
        }
        Y[i] =(sumB - sumA) /A[0]
    }
    return Y
}

// mel = 2595* log10(1 + f/700)
// f = (10^(mel/2595) -1)*700
function melFreq(f){
    return 2595*Math.log10(1+f/700)
}
function freqMel(m){
    return 700*(Math.pow(10, m/2595)-1)
}

function melFilter(m, F, low, hi){
    var res = new Float32Array(m)
    var Fs = new Float32Array(m+2)
    var dk = audioContext.sampleRate/2/F.length
    var melMax = melFreq(hi/2)
    var melMin = melFreq(low/2)
    
    var melDelta = (melMax - melMin)/(m+1)
    for (var i=0; i<m+2; i++){
        Fs[i] = freqMel(melMin + melDelta*i)
    }
    for(var i=0; i<F.length; i++){
        var k = dk*i        
        for(var j=1; j<m+1; j++){
            if (k < Fs[j-1]) continue
            if (k > Fs[j+1]) continue
            if (k < Fs[j]){
                res[j-1] += F[i]*F[i]*2*(k-Fs[j-1])/((Fs[j]-Fs[j-1])*(Fs[j+1]-Fs[j-1]))*dk
            }else{
                res[j-1] += F[i]*F[i]*2*(Fs[j+1]-k)/((Fs[j+1]-Fs[j])*(Fs[j+1]-Fs[j-1]))*dk
            }           
        }
    }
    return res
}

var testSig = [1,2,3,4,5,6,7,8,2,3,4,5,6,7,8,9]

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


var dctSig = DCT(testSig)
var idctSig = IDCT(dctSig)

var tempFFT = {}
var c = 0
function Type2DCTusingFFT(sig){
    var n = 1 << Math.ceil(Math.log2(sig.length))    
    var nn = n * 4
    var m = sig.length
    var ret = new Float32Array(n)
    var _real = new Float32Array(nn)
    for(var i=0; i<n;i++){
        _real[i*2] = 0
        _real[i*2+1] = sig[i] || 0
        _real[nn-2*i-2] = 0
        _real[nn-2*i-1] = sig[i] || 0
    }
    var temp = FFT({real:_real,imag:[]},0,nn).real
    tempFFT[c++] = temp
    a = Math.sqrt(2/nn)
    for(var j=0; j<n; j++){
        ret[j] = a * temp[j]
    }
    ret[0] /= Math.sqrt(2)
    
    return ret
}

function Type2IDCTusingIFFT(sig){
    var n = 1 << Math.ceil(Math.log2(sig.length))    
    var nn = n * 4
    var m = sig.length
    var ret = new Float32Array(n)
    var _real = new Float32Array(nn)   

    for(var i=0; i<n;i++){
        _real[i] = sig[i] || 0
        _real[n*2 - i - 1] = -sig[i+1] || 0
        _real[n*2 + i] = -sig[i] || 0
        _real[n*4 - i - 1] = sig[i+1] || 0
    }
    _real[0] *=  Math.sqrt(2)
    _real[n*2] *=  Math.sqrt(2)
    
    var temp = IFFT({real:_real,imag:[]},0,nn).real
    tempFFT[c++] = temp
    a = Math.sqrt(2/nn)
    for(var j=0; j<n; j++){
        ret[j] = temp[2*j+1]/a
    }
    return ret
}

var dctSig2 = Type2DCTusingFFT(testSig)
var idctSig2 = Type2IDCTusingIFFT(dctSig2)


/*

[a, b, c, d] 
(DCT) => 
[A, B, C, D]

[0, a, 0, b, 0,  c,  0,  d,  0,  d,  0,  c, 0, b, 0, a]
(FFT) =>
[A, B, C, D, 0, -D, -C, -B, -A, -B, -C, -D, 0, D, C, B]
 

*/

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

function dist2(A,B){
    var n = A.length
    var d = 0
    var a = 0
    for(var i=0; i<n ;i++){
        a = (A[i]-B[i])
        d += a*a
    }
    return Math.sqrt(d)
}
function cosDist(A,B){
    var n = A.length
    var d = 0
    var a = 0
    var b = 0
    for(var i=0; i<n ;i++){
        d += A[i]*B[i]
        a += A[i]*A[i]
        b += B[i]*B[i]
    }
    return 1 - d/Math.sqrt(a*b)
}

function frameEnergy(frame){
    var n = frame.length
    var e = 0
    for(var i=0; i<n; i++){
        e += frame[i]*frame[i]
    }
    return e/n
}



//DTW

var n = 2
function dtw(){    
    if (--n) return
    
    //silence cut
    var poiSegs = silenceCut(poi)[0]
    var sec1Segs = silenceCut(sec1)


    drawing.clearArea(ctx,canvasArea.getHoleArea())

    var sL = sec1Segs[si].length
    var pL = poiSegs.length
    var vc = 12*3
    var mainW = canvas.width - vc
    var mainH = canvas.height - vc

    var mainArea = {x:0,y:0,w:mainW,h:mainH}
    var secArea = {x:0,y:mainH,w:mainW,h:vc}
    var poiArea = {x:mainW,y:0,w:vc,h:mainH}

    var poiData = poiSegs[0].reduce((a,b,i)=>{a.push(poiSegs.map(y=>y[i]));/*console.log(a);*/ return a},[])
    var secData = sec1Segs[si]
    var mainData = []
    for (var i=0;i<sL;i++){
        var col = []
        for(var j=0;j<pL;j++){
            col[j] = cosDist(poiSegs[j],sec1Segs[si][i])*1.5
        }
        mainData[i] = col
    }
    draw2DColor(mainData,ctx,mainArea)
    draw2DColor(poiData,ctx,poiArea)
    draw2DColor(secData,ctx,secArea)    

    //serach ,main (0,0)-> (sL,pL)
    var minD = []
    var dic = []
    var dics = {
        i: [-1,0],
        j: [0,-1],
        ij: [-1,-1],       
    }

    for (var i=0;i<sL;i++){
        minD[i] = []
        dic[i] = []
    }

    minD[0][0] = mainData[0][0]
    for (var j=1;j<pL;j++){
        minD[0][j] = minD[0][j-1] + mainData[0][j]
        dic[0][j] = dics.j
    }
    for (var i=1;i<sL;i++){
        minD[i][0] = minD[i-1][0] +0.5// mainData[i][0]        
        dic[i][0] = dics.i
        for(var j=1;j<pL;j++){
            var min = Infinity
            var md
            for (var ii in dics){
                var d = dics[ii]
                var t = minD[i+d[0]][j+d[1]]
                if (min > t){
                    min = t
                    md = d
                }
            }
            minD[i][j] = mainData[i][j] + min
            dic[i][j] = md
        }
    }

    
    var path = [[sL-1,pL-1]]
    for (var x=sL-1,y=pL-1; x>0 || y>0; ){        
        var d = dic[x][y]
        x+=d[0]
        y+=d[1]
        path.push([x,y])
    }
    //console.log(path)
    var dx = mainW/sL
    var dy = mainH/pL
    ctx.beginPath()
    for (var p of path){
        ctx.lineTo(dx*(p[0]+0.5),dy*(p[1]+0.5))
    }
    ctx.strokeStyle="#000000"
    ctx.stroke()
    console.log(minD[sL-1][pL-1])
    return 
}


function silenceCut(sec){
    var sil = true
    var lastSil = sil
    var seg = []
    var segs = []
    for (var i in sec.energy){
        lastSil = sil
        sil = sec.energy[i] < 1e-11
        if (sil && !lastSil){
            segs.push(seg)
        }
        if (!sil){
            if(lastSil){
                seg = []
            }
            seg.push(sec.MFCC[i])         
        }
    }
    lastSil = sil    
    if (!lastSil){
        segs.push(seg)        
    }
    return segs
}

