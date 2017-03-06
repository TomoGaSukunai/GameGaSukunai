var drawing = require("../../lib/drawing")

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

function createEnvelope(n_eighth){
    var sustain = audioContext.sampleRate*2/16*n_eighth - 1000-500-1000
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
var matnotes = require("./matnotes").split(" ").map(x=>matParse(x))
var cello = "do1f do1f so0f so0f la0f la0f mi0f mi0f fa0f fa0f do0f do0f fa0f fa0f so0f so0f".split(" ").map(x=>matParse(x))
var blkblock = "blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf".split(" ").map(x=>matParse(x))
var violin1 = [...blkblock, ...blkblock, ...blkblock, ...matnotes]
var violin2 = [...blkblock, ...blkblock, ...matnotes, ...blkblock]
var violin3 = [...blkblock, ...matnotes, ...blkblock, ...blkblock]
var cellos = []
for (var i=0; i<23; i++){
    cellos = cellos.concat(cello)
}
cellos = cellos.concat(matParse("blkf"))
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
    var holeArea = canvasArea.getHoleArea()
    drawing.clearArea(ctx, holeArea)
    drawing.drawByteBars(anaF, ctx, holeArea)
    //console.log(anaF.reduce((a,b)=>Math.max(a,b)))
    //console.log(anaF.reduce((a,b)=>Math.min(a,b)))
}
drawFreq()
playSigss(anylser, cellos, violin1, violin2, violin3)
console.log(Date.now() - then)