var drawing = require("../../lib/drawing")
var note = require("./note")

var then = Date.now()
var audioContext = new AudioContext()
var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

var canvasArea = new drawing.CanvasArea(canvas)

function playData(data, node){
    var buffer = audioContext.createBuffer(1, data.length, audioContext.sampleRate)
    var signal = buffer.getChannelData(0)    
    for (var i=0;i<data.length;i++){
        signal[i] = data[i]
    }
    var s = audioContext.createBufferSource()
    s.buffer = buffer
    s.connect(node)
    s.onended = function(){
        s.disconnect(node)
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

function createEnvelope(n_sixteenth){
    var sustain = audioContext.sampleRate*2/16*n_sixteenth - 1000-500-1000
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

function getFreqD(n, plus=0){
    var t = n*2 + (n>3?-1:0)
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
const envNames ={
    f: createEnvelope(4),
    e: createEnvelope(2),
    s: createEnvelope(1),
}
function matParse(mat){
    var name = noteNames[mat.slice(0,2)]
    var plus = parseInt(mat[2]) - 1
    var env = mat[3]    
    //console.log(name && getFreqD(name,plus),env)    
    return createNote(name && getFreqD(name,plus),envNames[env])
}
// var matnotes = require("./matnotes").split(" ").map(x=>matParse(x))
// var cello = "do1f do1f so0f so0f la0f la0f mi0f mi0f fa0f fa0f do0f do0f fa0f fa0f so0f so0f".split(" ").map(x=>matParse(x))
// var blkblock = "blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf".split(" ").map(x=>matParse(x))
// var violin1 = [...blkblock, ...blkblock, ...blkblock, ...matnotes]
// var violin2 = [...blkblock, ...blkblock, ...matnotes, ...blkblock]
// var violin3 = [...blkblock, ...matnotes, ...blkblock, ...blkblock]
// var cellos = [repeat(cello, 23), matParse("blkf")]

function playSigss(node, ...sigss){
    var c = sigss.length
    var n = sigss[0].reduce((a,b)=>a+b.length,0)
    var res = new Float32Array(n)
    for (var sigs of sigss){
        var idx = 0
        for (var sig of sigs)
            for(var x of sig){
                res[idx++] += x/c/2
            }        
    }    
    playData(res, node)
}
var anylser = audioContext.createAnalyser()
anylser.connect(audioContext.destination)
anylser.fftSize = 1024
var anaF = new Uint8Array(anylser.frequencyBinCount/8)

function drawFreq(){
    requestAnimationFrame(drawFreq)

    anylser.getByteFrequencyData(anaF)
    var area = canvasArea.getRow(2,0)
    drawing.clearArea(ctx, area)
    drawing.drawByteBars(anaF, ctx, area)
    //console.log(anaF.reduce((a,b)=>Math.max(a,b)))
    //console.log(anaF.reduce((a,b)=>Math.min(a,b)))
}
drawFreq()
//playSigss(anylser, cellos, violin1, violin2, violin3)
//console.log(Date.now() - then)

var t16 = 2/16
var atk = 0.01
var dec = 0.005
var rls = 0.01
var envelopes = {
    f: new note.EnvelopeADSR(atk, dec, 4*t16-atk-dec-rls, rls),
    e: new note.EnvelopeADSR(atk, dec, 2*t16-atk-dec-rls, rls),
    s: new note.EnvelopeADSR(atk, dec, t16-atk-dec-rls, rls),
}

//var noteMemo = {}
function parseNote(mat){
    var name = noteNames[mat.slice(0,2)]
    var plus = parseInt(mat[2]) - 1
    var env = mat[3]
    var freq = name && getFreqD(name,plus)
    //console.log(name && getFreqD(name,plus),env)    
    // if (noteMemo[env] === undefined){
    //     noteMemo[env] = {}
    // }
    // var ref = noteMemo[env]
    // if (ref[freq] === undefined){
    //     ref[freq] = new note.Note(freq, envelopes[env])
    // }
    // return ref[freq]
    return new note.Note(freq, envelopes[env])
}
function sigsFromNotess(...notess){    
    var sampleRate = audioContext.sampleRate
    var totalTime = notess[0].reduce((a,b)=>a+b.envelope.getTotal(),0)
    var totalN = Math.floor(sampleRate * totalTime)
    var sigs = new Float32Array(totalN)
    var c = notess.length
    for(var notes of notess){
        var past = 0
        var idx = 0
        for (var note of notes){
            var offset = idx/sampleRate - past
            // var sig = note.getSigs(offset, sampleRate)
            // var n = sig.length
            // for(var i=0; i<n; i++){
            //     sigs[idx++] += sig[i] /c/2
            // }
            idx = note.plusSigs(sigs, idx, offset, sampleRate, c)
            past += note.envelope.getTotal()
        }
    }
    return sigs
}
function repeat(x, n){
    var r = []
    for(var i=0; i<n; i++)
        r = r.concat(x)
    return r
}

parseNote = (mat)=>note.NoteLib.parseNote.apply(note.NoteLib,[mat])
var canon = require("./matnotes").split(" ").map(x=>parseNote(x))
var cello = "do1f do1f so0f so0f la0f la0f mi0f mi0f fa0f fa0f do0f do0f fa0f fa0f so0f so0f".split(" ").map(x=>parseNote(x))
var blkblock = "blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf".split(" ").map(x=>parseNote(x))

var violin1 = [...blkblock, ...blkblock, ...blkblock, ...canon]
var violin2 = [...blkblock, ...blkblock, ...canon, ...blkblock]
var violin3 = [...blkblock, ...canon, ...blkblock, ...blkblock]
var cellos = [...repeat(cello,23), parseNote("blkf")]
console.log(Date.now() - then)
playData(sigsFromNotess(cellos, violin1, violin2, violin3), anylser)
console.log(Date.now() - then)