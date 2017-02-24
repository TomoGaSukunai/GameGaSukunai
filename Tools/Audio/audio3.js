var auCtx = new AudioContext()
auCtx.suspend().then(function(){
    console.log("sus")
    console.log(auCtx.currentTime)
})

var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

var processer = auCtx.createScriptProcessor(1024,1,1)

var datalogger = []
var count = 0
var process = true
processer.onaudioprocess = function(e){
    console.log(auCtx.currentTime)
    auCtx.suspend().then(function(){
      console.log("sus")
      console.log(auCtx.currentTime)
      if (process) auCtx.resume().then(function(){
          console.log("res")
          console.log(auCtx.currentTime)
      })
    })
    
    var inputBuffer = e.inputBuffer
    var outputBuffer = e.outputBuffer
    var inputData = inputBuffer.getChannelData(0)
    var outputData = outputBuffer.getChannelData(0)
    
    for (var i =0; i< inputBuffer.length;i++){
        outputData[i] = inputData[i]
        datalogger[count++] = inputData[i]
    }
    //console.log(inputData)
    //draw(outputData)
}

function draw(data){
    ctx.clearRect(0,0,canvas.width,canvas.height)

    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i in data){
        ctx.lineTo( i * canvas.width/data.length, canvas.height/2 *(1+ data[i]))
    }
    //ctx.closePath()
    ctx.stroke()
}

processer.connect(auCtx.destination)


//tri1.start()

canvas.onclick = function(){
    auCtx.resume().then(function(){
        console.log("res")  
    })
}




var fs = require("fs")
var data = fs.readFileSync("./tools/audio/data1.base64","UTF-8")
var dataArray = new Uint8Array(Buffer.from(data,"base64"))
var audioBuffer = null


auCtx.decodeAudioData(dataArray.buffer,function(buffer){
    audioBuffer = buffer
    var s = auCtx.createBufferSource()
    s.connect(processer)
    s.buffer = buffer
    //s.loop = true
    
    s.onended = function(){
        console.log("fin")
        process = false
        setTimeout(()=>{draw(datalogger)})
        //console.log(datalogger)
    }
    s.start()
    auCtx.resume()
})