const Note = class {
    constructor(freq, envelope){
        this.freq = freq
        this.w = Math.PI * 2 / freq
        this.envelope = envelope
    }
    getVal(t){
        return Math.sin(t*this.w) * this.envelope.getGain(t)
    }
    getVals(start, dt, end){
        let n = Math.floor((end-start)/dt)
        let res = new Float32Array(n)
        let ts = new Float32Array(n)        
        for (let i=0; i<n; i++){
            ts[i] = dt*i
        }
        let gains = this.envelope.getGains(ts)        
        for (let i=0; i<n; i++){
            res[i] = Math.sin(ts[i]*this.w) * gains[i]
        }
        return res
    }
}

const Envelope = class {
    getGain(t){
        return 1;
    }
    getGains(ts){
        let res = new Float32Array(ts.length)
        let idx = 0
        for (let t of ts){
            res[idx++] = 1
        }
        return res
    }
}


const EnvelopeADSR = class extends Envelope {
    constructor(attack, decay, sustain, release){
        super()
        this.ts = [attack, decay, sustain, release, Infinity]
        this.gs = [
            (t) => t/attack,
            (t) => 1 - t/decay/4,
            (t) => 3/4,
            (t) => 3/4 *(1-t/release),
            (t) => 0,
        ]
    }
    getGain(t){
        var t = t
        for (let i in this.ts){            
            if (t <= this.ts[i]){
                return this.gs[i](t)
            }
            t -= this.ts[i]
        }
        return 0
    }
    getGains(ts){
        let res = new Float32Array(ts.length)
        let k = 0        
        let reduce = 0
        for(var i=0; i<ts.length; i++){
            var t = ts[i] - reduce
            for(;;k++){
                if (t <= this.ts[k]){
                    res[i] = this.gs[k](t)
                }
                t -= this.ts[k]
                reduce += this.ts[k]
            }
        }
        return res
    }
}
