let playData = function(data, node){
    let buffer = audioContext.createBuffer(1, data.length, audioContext.sampleRate)
    let signal = buffer.getChannelData(0)    
    for (let i=0;i<data.length;i++){
        signal[i] = data[i]
    }
    let s = audioContext.createBufferSource()
    s.buffer = buffer
    s.connect(node)
    s.onended = function(){
        s.disconnect(node)
    }
    s.start()
    return s
}

module.exports={
    playData,
}