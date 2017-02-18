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
        for (var layer of this.layers){
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            layer.render()
            ctx.drawImage(layer.canvas, layer.offset.x, layer.offset.y)            
        }
    }
}

var gameLayer = new CopyCanvasLayer(canvas)
gameLayer.state = {
    ball:{
        x: 320,
        y: 480,
        minX: 0,
        minY: 0,
        maxX: 640,
        maxY: 480,
        sx: 2,
        sy: 2,        
        timeStamp: Date.now(),
        move(){
            var now = Date.now()
            var dt = (now - this.timeStamp)/10
            this.x = this.x + dt * this.sx
            this.y = this.y + dt * this.sy
            if (this.x >= this.maxX || this.x <= this.minX)
                this.sx = -this.sx
                
            if (this.y >= this.maxY || this.y <= this.minY)
                this.sy = -this.sy
            this.timeStamp = now
        }
    },
    paddle:{
        x: 320,
        y: 480,
        w: 120,
        h: 10,
        s: 0.6,
        move(){
            var now = Date.now()
            keyState.leftSpan += keyState.leftPressed ? now - keyState.leftTime : 0
            keyState.rightSpan += keyState.rightPressed ? now - keyState.rightTime : 0 
            this.x = this.x - (keyState.leftSpan - keyState.rightSpan)*this.s
            keyState.leftSpan = 0
            keyState.rightSpan = 0
            keyState.leftTime = now
            keyState.rightTime = now
            if (this.x >= 640 - this.w/2)
                this.x = 640 - this.w/2
            if (this.x <= this.w/2)
                this.x = this.w/2                
        }
    },
}
gameLayer.drawBall = function(){
    this.state.ball.move()
    this.ctx.beginPath()
    this.ctx.arc(this.state.ball.x, this.state.ball.y, 10, 0, Math.PI * 2)
    this.ctx.closePath()
    this.ctx.fillStyle = "blue"
    this.ctx.fill()
}
gameLayer.drawPaddle = function(){
    this.state.paddle.move()
    this.ctx.beginPath()
    this.ctx.rect(this.state.paddle.x - this.state.paddle.w/2, this.state.paddle.y - this.state.paddle.h,
        this.state.paddle.w, this.state.paddle.h)
    this.ctx.closePath()
    this.ctx.fillStyle = "blue"
    this.ctx.fill()
}
gameLayer.render = function(){
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    this.drawBall()
    this.drawPaddle()
}

manager.addLayer(gameLayer)

var keyState = {
    leftPressed: false,
    leftTime: 0,
    leftSpan: 0,
    rightPressed: false,
    rightTime: 0,
    rightSpan: 0,
}

function getHandler(bool){
    return function handlerKey(e){
        if (e.keyCode === 37){
            keyState.leftPressed = bool
            if (!bool){
                keyState.leftSpan += Date.now() - keyState.leftTime
            }else {
                keyState.leftTime = Date.now()
            }
            console.log(e)
        }else if (e.keyCode === 39){
            keyState.rightPressed = bool
            if (!bool){
                keyState.rightSpan += Date.now() - keyState.rightTime
            }else {
                keyState.rightTime = Date.now()
            }
            console.log(e)
        }
    }
}

document.addEventListener("keydown", getHandler(true))
document.addEventListener("keyup", getHandler(false))

function main (){    
    requestAnimationFrame(main)
    manager.render()
}

main()