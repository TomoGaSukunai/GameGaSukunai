const bitInv = function(n){
    const nn = Math.log2(n)
    return function(m){        
        let r = 0
        let t = m
        for (let i=0; i<nn; i++){
            r <<= 1
            r += t%2
            t >>= 1
        }
        return r
    }
}
let WN_memo = {}
const WN = function(n){
    const tic = Math.PI * 2 / n    
    if (!WN_memo.hasOwnProperty(n)){        
        WN_memo[n] = {
            cos: wat(Math.cos),
            sin: wat(Math.sin),
        }
    }
    return WN_memo[n]
    function wat(method){
        let memo = new Float32Array(n/2)
        return function(i){
            i = i % n
            if (!memo[i])
                memo[i] = method(-i* tic)
            return memo[i]
        }
    }
}
// DIT
const FFT = function(comp, offset, length){
    const _real = comp.real
    const _imag = comp.imag
    const n = length
    const {cos, sin} = WN(n)
    const pair = bitInv(n)
    let real = new Float32Array(n)
    let imag = new Float32Array(n)
    for (let i = 0; i < n; i++){
        real[i] = _real[offset + pair(i)] || 0
        imag[i] = _imag[offset + pair(i)] || 0
    }    
    for (let k = 1, k2; k < n; k = k2){        
        k2 = k<<1
        for(let j = 0; j < k; j++){
            const temp = {
                real: cos(j*n/k2),
                imag: sin(j*n/k2),
            }
            for(let i = j; i < n; i += k2){
                const p = {
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
const IFFT = function(comp, offset, length){
    const _real = comp.real
    const _imag = comp.imag
    const n = length
    const {cos, sin} = WN(n)
    const pair = bitInv(n)
    let real = new Float32Array(n)
    let imag = new Float32Array(n)
    for (let i = 0; i < n; i++){
        real[i] = (_real[offset + pair(i)] || 0)/n
        imag[i] = (_imag[offset + pair(i)] || 0)/n
    }    
    for (let k = 1, k2; k < n; k = k2){        
        k2 = k<<1
        for(let j = 0; j < k; j++){
            const temp = {
                real: cos(j*n/k2),
                imag: -sin(j*n/k2),
            }
            for(let i = j; i < n; i += k2){
                const p = {
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

Amplitude = function(comp){
    var {real, imag} = comp
    var n = real.length/2
    var res = new Float32Array(n)
    for (var k = 0; k < n; k++){
        res[k] = Math.sqrt(real[k]*real[k] + imag[k]*imag[k])/n
    }
    return res
}

module.exports = {FFT, IFFT, Amplitude}