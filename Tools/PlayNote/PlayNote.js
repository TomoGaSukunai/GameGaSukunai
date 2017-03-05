var audioContext = new AudioContext()
var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")
function playData(data){

    var buffer = audioContext.createBuffer(1, data.length, audioContext.sampleRate)
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

function createNote(freq, envelope){
    var n = envelope.attack + envelope.decay + envelope.sustain + envelope.release
    var res = new Float32Array(n)
    var idx = 0
    var wt = Math.PI*2*freq/audioContext.sampleRate

    for (var i=0; i<envelope.attack; i++){
        res[idx++] = Math.sin(idx * wt) * (i/envelope.attack)        
    }
    for(var i=0; i<envelope.decay; i++){
        res[idx++] = Math.sin(idx * wt) * (1 - i/envelope.decay/4)
    }
    for(var i=0; i<envelope.sustain; i++){
        res[idx++] = Math.sin(idx * wt) * 0.75
    }
    for(var i=0; i<envelope.release; i++){
        res[idx++] = Math.sin(idx * wt) * (1 - i/envelope.release) * 0.75
    }    
    return res
}

function createEnvelope(n_eighth){
    var sustain = audioContext.sampleRate*4/8*n_eighth - 1000-500-1000
    return {
        attack: 1000,
        decay: 500,
        sustain: sustain,
        release: 1000
    }
}

const dNote = Math.log(2)/12
function getFreq(n, plus=0){
    var t = n*2 + (n>3?-1:0) - 2
    return Math.exp(dNote*(t+12*plus))*261.626
}

function playNotes(notes){
    var sigs = []
    var n = 0
    for(var note of notes) {
        var sig = createNote(getFreq(note[0],note[1]), createEnvelope(note[2]))
        sigs.push(sig)
        n += sig.length
    }
    var res = new Float32Array(n)
    var idx = 0
    for (var sig of sigs)
        for(var x of sig){
            res[idx++] = x/2
        }
    playData(res)
}

function createSlope(freq1, freq2, envelope){
    var n = envelope.attack + envelope.decay + envelope.sustain + envelope.release
    var res = new Float32Array(n)
    var idx = 0
    var wt1 = Math.PI*2*freq1/audioContext.sampleRate
    var wt2 = Math.PI*2*freq2/audioContext.sampleRate
    var dwt  = (wt2-wt1)/envelope.sustain
    for (var i=0; i<envelope.attack; i++){
        res[idx++] = Math.sin(idx * wt1) * (i/envelope.attack)        
    }
    for(var i=0; i<envelope.decay; i++){
        res[idx++] = Math.sin(idx * wt1) * (1 - i/envelope.decay/4)
    }
    for(var i=0; i<envelope.sustain; i++){
        //res[idx++] = Math.sin(idx * (wt1 + i*dwt)) * 0.75
        res[idx++] = Math.sin(idx * wt1) * (1 - i/envelope.sustain)*0.75
                    + Math.sin(idx * wt2) * (i/envelope.sustain)*0.75
    }
    for(var i=0; i<envelope.release; i++){
        res[idx++] = Math.sin(idx * wt2) * (1 - i/envelope.release) * 0.75
    }    
    return res
}

createSlope(getFreq(3,0),getFreq(5,0),createEnvelope(2))
function drawArrayRow(data, ctx, area){
    //ctx.clearRect(area.x, area.y, area.w, area.h)
    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i=0; i<data.length; i++){        
        ctx.lineTo(area.x + i/data.length*area.w, area.y + area.h/2*(1 - data[i]))        
    }
    ctx.stroke()
}
function holeArea(){
    return {x:0,y:0,w:canvas.width,h:canvas.height}
}

var canon = [
    [4,1,4],[3,1,4],[2,1,4],[1,1,4],
    [7,0,4],[6,0,4],[7,0,4],[1,1,4],
    [3,1,4],[1,1,4],[7,0,4],[6,0,4],
    [5,0,4],[4,0,4],[5,0,4],[3,0,4],
    [24,0,4],[65,0,4],[42,0,4],[43,0,4],
    [27,-1,4],[26,0,4],[57,0,4],[65,0,4],
    [42,0,4],[31,1,4],[24,11,4],[66,10,4],
    [75,0,4],[64,1,4],[22,01,4],[2,1,3],[1,1,1],
    [2,1,1],[1,1,1],[2,1,1],[2,0,1],
    //TODO
]

function playNotes(notes){
    var sigs = []
    var n = 0
    for(var note of notes) {
        
        var sig
        if (note[0]>10)
            sig = createSlope(getFreq(Math.floor(note[0]/10),Math.floor(note[1]/10)),getFreq(note[0]%10,note[1]%10), createEnvelope(note[2]))    
        else
            sig = createNote(getFreq(note[0],note[1]), createEnvelope(note[2]))
        sigs.push(sig)
        n += sig.length
    }
    var res = new Float32Array(n)
    var idx = 0
    for (var sig of sigs)
        for(var x of sig){
            res[idx++] = x/2
        }
    playData(res)
}