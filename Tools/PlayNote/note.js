let Counter={}
function count(id){
    if(Counter[id] === undefined)
        Counter[id] = 1
    else
        Counter[id]++
}

const Note = class {
    constructor(freq, envelope){
        this.w = Math.PI * 2 *   freq
        this.envelope = envelope
        this.memo = {}
    }
    getSigs(offset, sampleRate){
        //count("getSigs")
        if (this.memo[sampleRate] === undefined){
            this.memo[sampleRate] = {}
        }
        let temp_memo = this.memo[sampleRate]
        if (temp_memo[offset] === undefined){
            //count("getSigs.run")            
            let dt = 1/sampleRate
            let gains = this.envelope.getGains(offset, sampleRate)
            let n = gains.length
            let res = new Float32Array(n)
            let t = 0
            for (let i=0; i<n; i++){                
                res[i] = Math.sin(t*this.w) * gains[i]
                t += dt
            }
            temp_memo[offset] = res
        }        
        return temp_memo[offset]
    }
    plusSigs(array, offsetN, offset, sampleRate, c){
        //count("plusSigs")
        let sigs = this.getSigs(offset, sampleRate)
        let n = sigs.length
        let j = offsetN
        for (let i=0; i<n; i++, j++){
            array[j] += sigs[i] /c/2
        }
        return j
    }
}

const EnvelopeADSR = class{
    constructor(attack, decay, sustain, release){  
        this.ts = [attack, decay, sustain, release, Infinity]
        this.gs = [
            (t) => t/attack,
            (t) => 1 - t/decay/4,
            (t) => 3/4,
            (t) => 3/4 *(1-t/release),
            (t) => 0,
        ]
        this.memo = {}
    }
    getGains(offset, sampleRate){
        count("getGains")
        if (this.memo[sampleRate] === undefined){
            this.memo[sampleRate] = {}
        }
        let temp_memo = this.memo[sampleRate]
        if (temp_memo[offset] === undefined){
            count("getGains.run")
            let n = Math.floor((this.getTotal()-offset)*sampleRate)
            let dt = 1/sampleRate
            let res = new Float32Array(n)
            let t = 0
            let k = 0
            for (let i=0; i<n; i++){                
                let gain = 0
                for(;;k++){
                    if (t < this.ts[k]){
                        res[i] = this.gs[k](t)
                        break
                    }
                    t -= this.ts[k]                    
                }
                t += dt
            }
            temp_memo[offset] = res
        }        
        return temp_memo[offset]
    }
    getTotal(){
        return this.ts.reduce((a,b)=>a+(isFinite(b)?b:0))
    }
}


const noteNames = {
    do: 1,
    re: 2,
    mi: 3,
    fa: 4,
    so: 5,
    la: 6,
    ti: 7,
    tb: 6.5,
    bl: 0,
}
const t16 = 2/16
const atk = 0.01
const dec = 0.005
const rls = 0.01
const envelopes = {
    f: new EnvelopeADSR(atk, dec, 4*t16-atk-dec-rls, rls),
    e: new EnvelopeADSR(atk, dec, 2*t16-atk-dec-rls, rls),
    s: new EnvelopeADSR(atk, dec, t16-atk-dec-rls, rls),
}
const dNote = Math.log(2)/12
const NoteLib = {
    memo:{},
    parseNote(mat){
        const name = noteNames[mat.slice(0,2)]
        const plus = parseInt(mat[2]) - 1
        const env = mat[3]
        const freq = name && this.getFreqD(name,plus)
        //console.log(name && getFreqD(name,plus),env)    
        if (this.memo[env] === undefined){
            this.memo[env] = {}
        }
        const ref = this.memo[env]
        if (ref[freq] === undefined){
            ref[freq] = new note.Note(freq, envelopes[env])
        }
        return ref[freq]
    },
    getFreqD(n, plus=0){
        const t = n*2 + (n>3?-1:0)
        return Math.exp(dNote*(t+12*plus))*261.626
    }
}

module.exports={
    Note,
    EnvelopeADSR,
    NoteLib,
    Counter
}