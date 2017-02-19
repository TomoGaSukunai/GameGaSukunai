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

var theBall = {
    x: 320,
    y: 480 - 20,
    radius: 10,
    minX: 10,
    minY: 10,
    maxX: canvas.width - 10,
    maxY: canvas.height - 20,
    sx: 0.2,
    sy: 0.2,
    last: Date.now(),
    attemptMove(){
        var now = Date.now()
        var dt = now - this.last
        return{
            x: this.x + dt * this.sx,
            y: this.y + dt * this.sy,
            t: now,
        }
    },    
    move(x, y, t){
        this.x = x
        this.y = y
        this.last = t
    }
}

var thePaddle = {
    x: 320,
    y: 480,
    w: 120,
    h: 10,
    s: 0.6,
    keyState: null,
    move(){
        this.x = this.x - (this.keyState.left.popSpan() - this.keyState.right.popSpan())*this.s
        if (this.x >= 640 - this.w/2)
            this.x = 640 - this.w/2
        if (this.x <= this.w/2)
            this.x = this.w/2                
    }
}

class Brick{
    constructor(x,y,w,h){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
    hit(x,y){
        return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h
    }
}
var theBricks = []
for (var x=80; x<640-80; x+= 80){
    for (var y=20; y<200; y+= 40){
        theBricks.push(new Brick(x+20,y+10,60,20))
    }
}


var gameLayer = new CopyCanvasLayer(canvas)
gameLayer.state = {
    ball: theBall,
    paddle: thePaddle,
    bricks: theBricks,
}
gameLayer.drawBall = function(ball){
    this.ctx.beginPath()
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    this.ctx.closePath()
    this.ctx.fillStyle = "blue"
    this.ctx.fill()
}
gameLayer.drawPaddle = function(paddle){
    this.ctx.beginPath()
    this.ctx.rect(paddle.x - paddle.w/2, paddle.y - paddle.h, paddle.w, paddle.h)
    this.ctx.closePath()
    this.ctx.fillStyle = "blue"
    this.ctx.fill()
}
gameLayer.drawBrick = function(brick){
    ctx.beginPath()
    ctx.rect(brick.x,brick.y,brick.w,brick.h)
    ctx.fillStyle = "blue"
    ctx.closePath()
    ctx.fill()
}
gameLayer.render = function(){
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    this.drawBall(this.state.ball)
    this.drawPaddle(this.state.paddle)
    for(var brick of this.state.bricks){
        this.drawBrick(brick)
    }
}

manager.addLayer(gameLayer)

class PressedTimer {
    constructor(){
        this.pressed = false
        this.time = 0
        this.span = 0
    }
    setStatus(b){
        var now = Date.now()
        this.span += this.pressed ? now - this.time : 0
        this.time = now
        this.pressed = b
    }
    popSpan(){
        this.setStatus(this.pressed)
        var r = this.span
        this.span = 0
        return r
    }
}

var keyState = {
    left: new PressedTimer(),
    right: new PressedTimer(),
}

function getHandler(bool){
    return function handlerKey(e){
        if (e.keyCode === 37){
            keyState.left.setStatus(bool)
        }else if (e.keyCode === 39){
            keyState.right.setStatus(bool)            
        }
    }
}

document.addEventListener("keydown", getHandler(true))
document.addEventListener("keyup", getHandler(false))

thePaddle.keyState = keyState
function main (){    
    requestAnimationFrame(main)
    thePaddle.move()
    
    var dst = theBall.attemptMove()
    theBall.move(dst.x, dst.y, dst.t)

    for(var idx in theBricks){
        var brick = theBricks[idx]
        if (brick.hit(dst.x, dst.y)){
            theBricks.splice(idx, 1)
            var lx = theBall.sx > 0 ? brick.x : brick.x + brick.w
            var ly = theBall.sy > 0 ? brick.y : brick.y + brick.h
            var dd = (dst.x - lx) * theBall.sy - (dst.y -ly)* theBall.sx
            if (dd * theBall.sx * theBall.sy < 0){                
                theBall.x = 2 * lx - theBall.x                
                theBall.sx = -theBall.sx
            }else {
                theBall.y = 2 * ly - theBall.y                
                theBall.sy = -theBall.sy

            }
            break
        }
    }
            
    if (theBall.x > theBall.maxX || theBall.x < theBall.minX){
        if (theBall.x > theBall.maxX){
            theBall.x = 2 * theBall.maxX - theBall.x
        }else if (theBall.x < theBall.minX){
            theBall.x = 2 * theBall.minX - theBall.x
        }
        theBall.sx = -theBall.sx
    }

    if (theBall.y > theBall.maxY || theBall.y < theBall.minY){        
        if (theBall.y > theBall.maxY){
            if (theBall.x < thePaddle.x - thePaddle.w/2 || theBall.x > thePaddle.x + thePaddle.w/2){
                alert("Game Over")
                document.location.reload()
            }
            theBall.y = 2 * theBall.maxY - theBall.y
        } else if(theBall.y < theBall.minY){
            theBall.y = 2 * theBall.minY - theBall.y
        }
        theBall.sy = -theBall.sy
    }

    
    manager.render()
}

main()