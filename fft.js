/**
 * 
 *
 * */ 

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
    var {cos, sin} = WatN(n)
    var real = new Float32Array(n)
    var imag = new Float32Array(n)
    for (var k = 0; k < n; k++){
        real [k] = 0
        imag [k] = 0
        for(var i = 0; i < n; i++){
            real[k] += _real[i] * cos(k*i) + _imag[i] * sin(k*i)
            imag[k] += _real[i] * sin(k*i) + _imag[i] * cos(k*i)
        }
    }
    return {real, imag}
}

// fft 
function bitInv(n){
    var nn = Math.log2(n)
    return function(m){        
        var r = 0
        var t = m
        for (var i=0; i<nn; i++){
            r <<= 1
            r += t%2
            t >>= 1
        }
        return r
    }
}
var WN_memo = {}
var WN = function(n){
    if (!WN_memo.hasOwnProperty(n)){
        var tic = Math.PI * 2 / n
        WN_memo[n]={
            cos: wat(Math.cos),
            sin: wat(Math.sin),
        }
    }
    return WN_memo[n]
    function wat(method){
        var memo = new Float32Array(n/2)
        return function(i){
            i = i % n
            if (!memo[i])
                memo[i] = method( - i * tic)
            return memo[i]
        }
    }
}
// DIT
var FFT = function(comp){
    var _real = comp.real
    var _imag = comp.imag
    var n = _real.length
    var {cos, sin} = WN(n)
    var real = new Float32Array(n)
    var imag = new Float32Array(n)
    var pair = bitInv(n)
    for (var i = 0; i < n; i++){
        real[i] = _real[pair(i)]
        imag[i] = _imag[pair(i)]
    }

    
    for (var k = 1,k2; k < n; k = k2){        
        k2 = k<<1
        for(var j = 0; j < k; j++){
            var temp = {
                real: cos(j*n/k2),
                imag: sin(j*n/k2),
            }
            for(var i = j; i < n; i += k2){
                var p = {
                    real: temp.real * real[i+k] - temp.imag * imag[i+k],
                    imag: temp.real * imag[i+k] + temp.imag * real[i+k],
                }                
                real[i+k] = real[i] - p.real
                imag[i+k] = imag[i] - p.imag

                real[i] += p.real
                imag[i] += p.imag
            }
        }
    }
    return {real, imag}
}

//for test
var testData = new Float32Array(1024)

testData = testData.map((x,i)=>x + 0.8*Math.sin(20*i/1024*2*Math.PI))
testData = testData.map((x,i)=>x + 0.5*Math.cos(40*i/1024*2*Math.PI))
testData = testData.map((x,i)=>x + 0.2*Math.cos(80*i/1024*2*Math.PI))

var testComp = {
    real: testData,
    imag: new Float32Array(1024),
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
scp.onload = function(){drawData(amp(FFT(testComp)))}
*/


/*
nn = 64
now = Date.now()
for (var i=0;i<nn;i++)rrDFT(testData)
console.log(Date.now()-now)

now = Date.now()
for (var i=0;i<nn;i++)rDFT(testData)
console.log(Date.now()-now)

now = Date.now()
for (var i=0;i<nn;i++)DFT(testComp)
console.log(Date.now()-now)

now = Date.now()
for (var i=0;i<nn;i++)FFT(testComp)
console.log(Date.now()-now)

*/