/**
 * Euler's formula:
 * exp(i * w) = cos(w) + i*sin(w)
 *   
 * [exp(i * w) + exp (i * w)]/2 = cos(w)
 * [exp(i * w) - exp (i * w)]/2 = -i * sin(w)
 * 
 * 
 * f(x) = Int(1/2pi*Int(F(w) * exp(i*w*x))x=(0,2pi))w=[0,Inf]
 *   
 * for exp(i*w*x) ,has 
 * exp(i*w*x)*exp(-i*s*x) = 
 * {1, where w = s 
 *  0, where w != s }
 * 
 * 
 * F(w) = Int(f(x) * exp(-i*w*x))x=(0,2pi)
 * 
 *  discrete
 *  f(x) = sigma(F(i*w0)*exp(-i*w0*x) )[0,Inf]
 *  F(w) = 
 * 
 * */ 

var testData = new Float32Array(1024)

testData = testData.map((x,i)=>x + 0.8*Math.sin(20*i/1024*2*Math.PI))
testData = testData.map((x,i)=>x + 0.5*Math.cos(40*i/1024*2*Math.PI))
testData = testData.map((x,i)=>x + 0.2*Math.cos(80*i/1024*2*Math.PI))

var testComp = {
    real: testData,
    imag: new Float32Array(1024),
}
//for real signal
var rDFT = function(data){
    var n = data.length
    var real = new Float32Array(n)
    var imag = new Float32Array(n)
    var {cos, sin}=Math
    var tic = Math.PI * 2 / n
    for (var k = 0; k < n; k++){
        real [k] = 0
        imag [k] = 0
        for(var i = 0; i < n; i++){
            real[k] += data[i] * cos( -k*i*tic)
            imag[k] += data[i] * sin( -k*i*tic)
        }
    }
    return {real, imag}
}

var WatN_memo = {}
var WatN = function(n){
    if (!WatN_memo.hasOwnProperty(n)){
        var tic = Math.PI * 2 / n
        WatN_memo[n]={
            cos: wat(Math.cos),
            sin: wat(Math.sin),
        }
    }
    return WatN_memo[n]
    function wat(method){
        var memo = new Float32Array(n)
        return function(i){
            i = i % n
            if (!memo[i])
                memo[i] = method( - i * tic)
            return memo[i]
        }
    }
}

//speedup by memorify
var rrDFT = function(data){
    var n = data.length
    var real = new Float32Array(n)
    var imag = new Float32Array(n)
    var {cos, sin} = WatN(n)
    var tic = Math.PI * 2 / n
    for (var k = 0; k < n; k++){
        real [k] = 0
        imag [k] = 0
        for(var i = 0; i < n; i++){
            real[k] += data[i] * cos(k*i)
            imag[k] += data[i] * sin(k*i)
        }
    }
    return {real, imag}
}

//for comp signal
var DFT = function(comp){
    var _real = comp.real
    var _imag = comp.imag
    var n = _real.length
    var real = new Float32Array(n)
    var imag = new Float32Array(n)
    for (var k = 0; k < n; k++){
        real [k] = 0
        imag [k] = 0
        for(var i = 0; i < n; i++){
            real[k] += _real[i] * Math.cos( -Math.PI*2*k*i/n)
                     + _imag[i] * Math.sin( -Math.PI*2*k*i/n)
            imag[k] += _real[i] * Math.sin( -Math.PI*2*k*i/n)
                     + _imag[i] * Math.cos( -Math.PI*2*k*i/n)
        }
    }
    return {real, imag}
}

var drawData = function(data){
    var n = data.length
    var canvas = document.createElement("canvas")
    ctx = canvas.getContext("2d")
    for(var i = 0; i < n; i++){
        //debugger
        ctx.lineTo(i/n*canvas.width, (1 - data[i])*canvas.height)
    }
    ctx.stroke()
    document.body.appendChild(canvas)
}

var amp = function (comp){
    var {real, imag} = comp
    var n = real.length/2
    var res = new Float32Array(n)
    for (var k = 0; k < n; k++){
        res[k] = Math.sqrt(real[k]*real[k] + imag[k]*imag[k])/n
    }
    return res
}
/*
scp = document.createElement("script")
scp.src = "fft.js"
document.body.appendChild(scp)
scp.onload = function(){drawData(amp(DFT(testComp)))}
*/


/*
nn = 64
now = Date.now()
for (var i=0;i<nn;i++)rrDFT(testData)
console.log(Date.now()-now)

now = Date.now()
for (var i=0;i<nn;i++)rDFT(testData)
console.log(Date.now()-now)
*/