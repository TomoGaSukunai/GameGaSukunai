var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

class Layer{
    constructor(x,y,w,h){
        this.offset = {
            x: x,
            y: y,
        }
        this.size = {
            w: w,
            h: h,
        }

        this.canvas = document.createElement("canvas")
        this.canvas.width = w
        this.canvas.height = h
        this.ctx = this.canvas.getContext("2d")
    }   
    render (){

    }
}

class CopyCanvasLayer extends Layer{
    constructor(canvas){
        super(0, 0, canvas.width, canvas.height)
    }
}

var manager = {
    layers: [],
    addLayer(layer){
        this.layers.push(layer)
    },
    render(){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (var layer of this.layers){            
            layer.render()
            ctx.drawImage(layer.canvas, layer.offset.x, layer.offset.y)            
        }
    }
}


class Hole{
    constructor(x,y){
        this.x = x 
        this.y = y
        this.style = ""
        this.isPop = false
        this.isHit = false
        this.timeStamp = Date.now()
        this.popY = 70
    }
    hit(x,y){
        var ret = x > this.x - 30 && x < this.x + 30 
                && y < this.y && y > this.y - 200
        
        if (ret){
            this.style = "rgb(196,128,128)"            
            this.isHit = true
            this.timeStamp = Date.now()
            //console.log(this)
            //console.log("hit")
        }
        return ret
    }
    pop(){
        this.style = "rgb(128,128,196)"
        this.timeStamp = Date.now()
        this.isPop = true
    }
    update(t){        
        if (this.isHit){
            if (t > this.timeStamp + 200){
                this.popY = 70
            }            
        }else if (this.isPop){
            this.popY = this.getY(t - this.timeStamp)
        }else {
            this.popY = 70
        }
        if (this.popY >= 70){
            this.isPop = false   
            this.isHit = false         
            return true
        }
        return false        
    }
    getY(dt){
        return x = (dt - 1000)*dt/500/500*70 + 70
    }
}

var theHoles = []

for (var y = 120; y < 480 ;y+=120){
    for (var x = (y/2)%120 + 100; x < 640 - 60; x+= 120){
        theHoles.push(new Hole(x,y))
    }
}

var gameLayer = new CopyCanvasLayer(canvas)
gameLayer.state = {
    holes: theHoles
}
gameLayer.drawHole = function(hole){    
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(hole.x,hole.y,30,10,0,0,Math.PI*2)       
    ctx.stroke()
    ctx.rect(hole.x-50,hole.y-200,100,200)
    ctx.clip()
    ctx.beginPath()
    ctx.ellipse(hole.x,hole.y+hole.popY,30,60,0,0,Math.PI*2)
    ctx.closePath()
    ctx.fillStyle = hole.style
    ctx.fill()
    ctx.restore()
}
gameLayer.render = function(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
    for (var hole of this.state.holes){
        this.drawHole(hole)
    }    
    this.ctx.fillText("Scort:" + score,20,20)
}

var clickState = {x:0,y:0,f:false}
var clickHandler  = function(e){
    //console.log(e.x,e.y)
    clickState.x = e.x
    clickState.y = e.y
    clickState.f = true
}

document.addEventListener("click", clickHandler)

var animation
var stopFlag = false
function main(){
    var animation = requestAnimationFrame(main)
    stopFlag && cancelAnimationFrame(animation)
    
    var now = Date.now()
    for (var hole of theHoles){
        if (!hole.isPop) continue
        if (clickState.f && hole.hit(clickState.x, clickState.y)){
            score ++ 
        }
        if (hole.update(now)){
            poped--
        }
    }
    
    if (poped < 1){
        var idx  = Math.floor(Math.random()*theHoles.length)
        theHoles[idx].pop()
        poped++ 
    }
    clickState.f = false
    manager.render()
}

manager.addLayer(gameLayer)
var poped = 0
var score = 0
main()