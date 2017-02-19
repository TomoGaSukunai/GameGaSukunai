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
    sprites: [],
    addSprite(sprite){
        this.sprites.push(sprite)
    },
    addLayer(layer){
        this.layers.push(layer)
    },
    move(){
        for(var sprite of this.sprites){
            sprite.move()
        }
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
    move(){
        var now = Date.now()
        var dt = now - this.last
        this.x = this.x + dt * this.sx
        this.y = this.y + dt * this.sy

        if (this.x > this.maxX || this.x < this.minX){
            if (this.x > this.maxX){
                this.x = 2 * this.maxX - this.x
            }else if (this.x < this.minX){
                this.x = 2 * this.minX - this.x
            }
            this.sx = -this.sx
        }

        if (this.y > this.maxY || this.y < this.minY){        
            if (this.y > this.maxY){
                if (this.x < thePaddle.x - thePaddle.w/2 || this.x > thePaddle.x + thePaddle.w/2){
                    alert("Game Over")
                    document.location.reload()
                }
                this.y = 2 * this.maxY - this.y
            } else if(this.y < this.minY){
                this.y = 2 * this.minY - this.y
            }
            this.sy = -this.sy
        }
        this.last = now
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

var gameLayer = new CopyCanvasLayer(canvas)
gameLayer.state = {
    ball: theBall,
    paddle: thePaddle,
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
gameLayer.render = function(){
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    this.drawBall(this.state.ball)
    this.drawPaddle(this.state.paddle)
}




manager.addSprite(theBall)
manager.addSprite(thePaddle)
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
    manager.move()
    manager.render()
}

main()