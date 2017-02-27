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
//for real signal
var DFT = function(data){
    var n = data.length
    var res = new Float32Array(n)
    for (var k = 0; k < n/2; k++){
        res[k] = 0
        for(var i = 0; i < n; i++){
            res[k] += data[i] * Math.cos( -Math.PI*2*k*i/n)
            res[k + n/2] += data[i] * Math.sin( -Math.PI*2*k*i/n)
        }
    }

    return res
}


var drawData = function(data){
    var n = data.length
    var canvas = document.createElement("canvas")
    ctx = canvas.getContext("2d")
    for(var i = 0; i < n; i++){
        //debugger
        ctx.lineTo(i/n*canvas.width, (1 - data[i]/n)*canvas.height)
    }
    ctx.stroke()
    document.body.appendChild(canvas)
}

var amp = function (data){
    var n = data.length/2
    var res = new Float32Array(n)  
    for (var k = 0; k < n; k++){
        res[k] = Math.sqrt(data[k]*data[k] + data[k+n]*data[k+n])
    }
    return res
}
/*
scp = document.createElement("script")
scp.src = "fft.js"
document.body.appendChild(scp)
scp.onload = function(){drawData(amp(DFT(testData)))}
*/