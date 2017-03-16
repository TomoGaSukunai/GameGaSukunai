var then = Date.now()

var drawing = require("../../lib/drawing")
var audio = require("../../lib/audio")
var note = require("./note")

var audioContext = new AudioContext()
var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

var canvasArea = new drawing.CanvasArea(canvas)

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
            //why does commented method run slower than below line ?
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

var anylser = audioContext.createAnalyser()
anylser.connect(audioContext.destination)
anylser.fftSize = 1024
var anaF = new Uint8Array(anylser.frequencyBinCount/8)
var area = canvasArea.getRow(2,0)

function drawFreq(){
    requestAnimationFrame(drawFreq)

    anylser.getByteFrequencyData(anaF)    
    drawing.clearArea(ctx, area)
    drawing.drawByteBars(anaF, ctx, area)
    //console.log(anaF.reduce((a,b)=>Math.max(a,b)))
    //console.log(anaF.reduce((a,b)=>Math.min(a,b)))
}
drawFreq()


var parseNote = note.NoteLib.parseNote.bind(note.NoteLib)
var canon = require("./matnotes").split(" ").map(x=>note.NoteLib.parseNote(x))
var cello = "do1f do1f so0f so0f la0f la0f mi0f mi0f fa0f fa0f do0f do0f fa0f fa0f so0f so0f".split(" ").map(x=>note.NoteLib.parseNote(x))
var blkblock = "blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf blkf".split(" ").map(x=>note.NoteLib.parseNote(x))

var violin1 = [...blkblock, ...blkblock, ...blkblock, ...canon]
var violin2 = [...blkblock, ...blkblock, ...canon, ...blkblock]
var violin3 = [...blkblock, ...canon, ...blkblock, ...blkblock]
var cellos = [...repeat(cello,23), parseNote("blkf")]


console.log(Date.now() - then)
var sigs = sigsFromNotess(cellos, violin1, violin2, violin3)
console.log(Date.now() - then)
var s = audio.playData(sigs, anylser)
console.log(Date.now() - then)