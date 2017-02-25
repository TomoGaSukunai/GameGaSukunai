function Get_PlayBuffer(auCtx){
        return function PlayBuffer(buffer, when = 0, offset = 0, durantion){
            durantion = durantion || buffer.durantion
            var s = auCtx.createBufferSource()
            s.buffer = buffer
            s.conext(auCtx.destination)
            s.start(auCtx.currentTime + t, offset, durantion)
        }
}

function drawArrayQ(data, ctx, area){
    ctx.clearRect(area.x, area.y, area.w, area.h)
    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i=0,j=0; i<area.w; i++){
        ctx.lineTo(area.x + i + 0.5, area.y + area.h/2)
        var ymax = 0
        var ymin = 0
        for(; j*area.w < i*data.length; j++){
            if (ymax < data[j]){ymax = data[j]}
            if (ymin > data[j]){ymin = data[j]}            
        }
        ctx.lineTo(area.x + i + 0.5, area.y + area.h/2*(1 + ymax))
        ctx.lineTo(area.x + i + 0.5, area.y + area.h/2*(1 + ymin))        
        ctx.lineTo(area.x + i + 0.5, area.y + area.h/2)
    }
    ctx.stroke()
}



module.exports = {
    PlayBuffer: Get_PlayBuffer,
    DrawArray: drawArrayQ,
}