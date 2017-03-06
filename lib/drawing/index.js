const drawFloatsRow = function(data, ctx, area){
    var n = data.length
    var mid = area.h/2
    var dx = area.w/(n-1)
    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i=0; i<n; i++){
        var v = 1 - data[i]
        ctx.lineTo(area.x + i*dx, area.y + mid*v)
    }
    ctx.stroke()
}

const drawFloatsCol = function(data, ctx, area){
    var n = data.length
    var mid = area.w/2
    var dy = area.h/(n-1)
    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i=0; i<n; i++){
        var v = 1 + data[i]
        ctx.lineTo(area.x + mid*v, area.y + i*dy)
    }
    ctx.stroke()
}

const drawBytesRow = function(bytes, ctx, area){    
    var n = bytes.length
    var mid = area.h/2
    var dx = area.w/(n-1)
    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i=0; i<n; i++){
        var v = 1 - bytes[i]/256
        ctx.lineTo(area.x + i*dx, area.y + mid*v)        
    }
    ctx.stroke()
}

const drawBytesCol = function(bytes, ctx, area){
    var n = bytes.length
    var mid = area.w/2
    var dy = area.h/(n-1)
    ctx.strokeStyle = "rgb(0,0,0)"
    ctx.beginPath()
    for (var i=0; i<n; i++){
        var v = 1 + bytes[i]/256
        ctx.lineTo(area.x + mid*v, area.y + i*dy)        
    }
    ctx.stroke()
}

const drawByteBars = function(bytes, ctx, area){
    var n = bytes.length
    var mid = area.h/2
    var dx = area.w/(n-1)    
    for (var i=0; i<n; i++){        
        var v = (bytes[i]/256)
        ctx.beginPath()
        ctx.rect(area.x + i * dx, area.y + mid, dx, area.y - v*mid)
        ctx.fillStyle = "rgb("+Math.floor(v*128 +100)+",50,50)"        
        ctx.fill()        
    }
    ctx.stroke()
}

const clearArea = function(ctx, area){
    ctx.clearRect(area.x, area.y, area.w, area.h)
}

module.exports = {
    drawFloatsRow,
    drawFloatsCol,
    drawBytesRow,
    drawBytesCol,
    drawByteBars,
    clearArea,
}