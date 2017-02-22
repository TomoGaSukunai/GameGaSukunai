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
    move(x, y, t){
        var now = Date.now()
        var dt = now - this.last
        this.x = this.x + dt * this.sx
        this.y = this.y + dt * this.sy
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
    this.ctx.beginPath()
    this.ctx.rect(brick.x,brick.y,brick.w,brick.h)
    this.ctx.fillStyle = "blue"
    this.ctx.closePath()
    this.ctx.fill()
}
gameLayer.render = function(){
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    this.drawBall(this.state.ball)
    this.drawPaddle(this.state.paddle)
    for(var brick of this.state.bricks){
        this.drawBrick(brick)
    }
    this.ctx.fillStyle = "green"
    this.ctx.font = "16px"
    this.ctx.fillText("Scort:" + score,20,20)
    this.ctx.fillText("Life:" + life,20,40)
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



var score = 0;
var life = 3;

var animation 
var stopFlag = false
function main (){
    var animation = requestAnimationFrame(main)
    stopFlag && cancelAnimationFrame(animation)
    thePaddle.move()    
    theBall.move()

    for(var idx in theBricks){
        var brick = theBricks[idx]
        if (brick.hit(theBall.x, theBall.y)){
            theBricks.splice(idx, 1)
            var lx = theBall.sx > 0 ? brick.x : brick.x + brick.w
            var ly = theBall.sy > 0 ? brick.y : brick.y + brick.h
            var dd = (theBall.x - lx) * theBall.sy - (theBall.y -ly)* theBall.sx
            if (dd * theBall.sx * theBall.sy < 0){
                theBall.x = 2 * lx - theBall.x
                theBall.sx = -theBall.sx
            }else {
                theBall.y = 2 * ly - theBall.y
                theBall.sy = -theBall.sy                
            }
            audioBrick.cloneNode().play()
            score++
            
            break
        }
    }

    if (theBricks.length === 0){       
        cancelAnimationFrame(animation)
        alert("win")
        document.location.reload()
    }
    
    if (theBall.x > theBall.maxX || theBall.x < theBall.minX){
        if (theBall.x > theBall.maxX){
            theBall.x = 2 * theBall.maxX - theBall.x
        }else if (theBall.x < theBall.minX){
            theBall.x = 2 * theBall.minX - theBall.x
        }
        audioBounce.cloneNode().play()
        theBall.sx = -theBall.sx
    }

    if (theBall.y > theBall.maxY || theBall.y < theBall.minY){
        if (theBall.y > theBall.maxY){
            if (theBall.x < thePaddle.x - thePaddle.w/2 || theBall.x > thePaddle.x + thePaddle.w/2){
                
                if (--life){
                    theBall.x = 320
                    theBall.y = 480
                    theBall.sx = 0.2
                    theBall.sy = 0.2
                }else{
                    cancelAnimationFrame(animation)
                    alert("Game Over")
                    document.location.reload()                    
                }
            }
            theBall.y = 2 * theBall.maxY - theBall.y
        } else if(theBall.y < theBall.minY){
            theBall.y = 2 * theBall.minY - theBall.y
        }
        audioBounce.cloneNode().play()
        theBall.sy = -theBall.sy
    }
    
    manager.render()
}


function CountToGo(n,callback){     
    var count = n
        return function(){
        if (!--count){
            callback()
        }
    }
}

var audioBounce = document.createElement("audio")
var audioBrick = document.createElement("audio")
audioBounce.src = "data:audio/mp3;base64,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+CxIoeohS2hrKnVmMf/zosROQKwN+ABj3twiGMTEI6EhQIjwB0YzEnkOTxpP1bFgsSujn6dLYcyqYYcBRT1gp1QthyuEM5XA5lVbd2GZiZstyqP1msrn6GzWxtTOaGuCecxul5J8dLChrpXK6N1NNaE+TxpLs0VCnnI/UJxKrYrEy1gsLipkOfXTzNaz6GhsR9q1mKOoYE+oKtblFvLChsROsvbVa1K58noieZswYv/+LZonlUfrQnVk5lphVsSNWDhtUMBPM28sSungssWtTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//OgxAAAAANIAAAAAExBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=="
audioBrick.src = "data:audio/mp3;base64,SUQzAwAAAAABPlRYWFgAAAASAAAAbWFqb3JfYnJhbmQATTRBIABUWFhYAAAAEQAAAG1pbm9yX3ZlcnNpb24AMABUWFhYAAAAIAAAAGNvbXBhdGlibGVfYnJhbmRzAE00QSBtcDQyaXNvbQBUWFhYAAAAFAAAAGdhcGxlc3NfcGxheWJhY2sAMABUSVQyAAAAEgAAADAxX3NlMTAxKOaxuuWumikAVFNTRQAAAA8AAABMYXZmNTUuMTkuMTAwAAAAAAAAAAAAAAD/86DAAAAAAAAAAAAASW5mbwAAAAcAAAAMAAAP6wAnJycnJycnJzs7Ozs7Ozs7Tk5OTk5OTk5iYmJiYmJiYmJ2dnZ2dnZ2domJiYmJiYmJnZ2dnZ2dnZ2dsbGxsbGxsbHExMTExMTExNjY2NjY2NjY2Ozs7Ozs7Ozs//////////9MYXZmNTUuMTkuMTAwAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OgxAA+I7ZlRVrYAQcClwqUlJKKSWYbpKSkqShwFAEVGCMrAoszq84NM8e0+vU9tkIvHS8Hp655ticOtmYhJAAGDAhdB+HYTHWO78bp6eNxuNv5GIxSUlJSUlJL6enp6fOvT08YpLGFJSRiWWNblcbp+4clb+P5GKSkpKSkpKenp6e3nnnnSUlJSUljDCxT09Pnnnnnnhhhhhh/54YYfnT09PbwwwwwwwpLFPT09PT09PT09JSUlJSUlJSUlPT09Pbzzr09JSWKlJKIxSWP1hhh+eedipSYYYYYWM888888888MMMMMMMMM888888888MKSkpKSxzOkpMI4eHgHh74YeHh49XhySCIgNeB4AJA2aRN9dzZ3Kctcqt19uiBBdqYRtI0xsUjEqlUBzFInzT8pvMIhjMYvn//zosQzTKwWireY6ADKwjMYolNFTsKAVKgEHIw+FY9ecSzOVjGVhFUYizWmXuxOmiCZkkavJ3WhqHZTDMSf67JZOq2T3InJPkj/yQwKBoeBRU/3qWAgSCRheDoAAj/vUi7kOq3mVfT092m+/6ASli0Xi16998wCAMIAfPXe71//+/XkEARFJZe73n73hDUdjZECit7//z///uXXJbo5K2l3rdv/u3jlXzobiQ4YCbl0krvyz6S///cg6DU5b4iA5lcCMrZfjnr+f/e61Gp6Zf2gtduf+9ZZWIAVoX7K5Ht7IH1rKkvf92/9K/jZniSqbqGABEqeLvne/6Rw4vfpf+5cuX6a9TU1K/sS+niiMIA5zn0ueMxlN1ZdfZ9LaW6ulasHl0VPKchCoVLN7MyijGQfMjL84cvzI8iP//OgxC1LPAqF4dngAA76NLTcwM/jIz1MMUg3G7DsTiMMLU3+0TPZxNNpU0KazLZRMulEyIKjGBMM4J41MejDA/M9nUONYyGQEPzB4PBgYMBAkaE5goFBUForKNor+o0px//8HwcmJBsHQd8GOR/wbB/s6TaZ0oizp8FEHwSSZy+Xvk+H/AkDPk+byQPRU92/GWdxprlLf+k///3x98Gds7Z2zv///////9/X9kjZJO/7/yX5K/i7X8ad//Jv//+SyeS/G4xGI3GI3GPoKKjjf0P0UbfR+H3g7///jNBQf8GQZBkGf///+5cH/BrlQdBn/////////9B//QUMajMaoo3R/QxuN0dHR//0f0d1gjpjPLldCKBtVt3HFYdIxORLkIya9B77Rtrqpmqqmaq1YQAPlgsLBYZYWv/zosQsRYv6keBm2txYLDdXQrLSwWmWFplhaZY6m6FplpYZa6G6uhiE2eRVmfEBn58ID8yBONsATXz4159MRfDE2M1I6NbFw51GmYzkbAxIZSCHJJBzuqAcY7ATN7QxCGmFEZm5CMABiBEBmAx0nMhIwgmNaij7985kdBwISAAcAEIDGlRrNduKQV19X+1uxYKisqj2LC0tLcqHrHsW5V5YMEMGLg9yorLR68ryv8ZyLHX//8ZyorHoWD2JUqHuWD2KyqW/8t8sywrj3CaCqJUJRKh6FsrLM55bx6CeDAD0j3lRZLJbKh6R7hNArB6iTyweo9R6lRUqOwqXUJhSZBbVi5uiI2hcTIUIeBKSw7DPH+/v+tJMZT7srRkkGyX17oEvTFU6TEQhGgDwwA9BheYyAMXNQaMAcCIw//OgxEJLo/JtQE+o3AcAYufBxgDADGAiBEhEheYGgH4XAtMDQD8aBoMG0NowYwhzDiC1MCMMYaFHMD4G0wWwRjAHBHMGwD8cAQMEcJgwkQGCwFqYjQmpi/DRmI2EgcQJMZiNBomFQDiYIgA5gmgKIXLtXbJX9ooeo4zDMm17kv/j+QguaQn8sCyhxKIsUxQJFTxNEWlkslosFv5KEWLZZHN6r/dduRUslstZaLcihblgihZLUsFu6yKkUItyzLAzOQouUZYQCD9SExmhzh+kJJT+ypLEIQkXKSxLDnEJH4lyVH8lAb2AXDA2SDZIAAcDaNAGNYYpGVj8moTOcNP1jInQhFA2GWl0OkBKEphPPj3ON00AwIy6kgfy+q7GyNlbMX1BoCBWAiDgIvLACAMAQMCYD0wJgJjAQP/zosQ/SRPqRAJnqt4JzARA8BwERgTgIGAiCoYE4CJgIgIGCoEGVgTA4E0wEQgjA9AmMIMCZRIGgemB6AgYE4HwNA9MCYBAwEQPPUSMCcBAwEAEDAmAnMIMNwwVQEQcFSYQQbphBAqGB6DWZRgnJlRCFmDXQGYnGSxhjDgmFeHkYNQkJgqBBGAgAiokgHUZ//////LiJm6CC01p0GTdTdN0GW606Fft////+JuJcc0VgliUJUlpKktJUlyUJX5KkuOYSvyVxdQvMXcLHeLoYoxBd//EFhBQGzQN5RBUYguhih5//h5QDAgBoNuAZVEweULIKv11c0FpXimm1lKiimMMvW1yD2Z20eremuPtEV02ZSzKVT77NOw5MtJjDbfIi3K9ACADL0ko6ADGAMgDBgBIAMYAOADDAAiP//OgxEdSC/IsAH/q3ABCWSHQBAwBkAGSlLohcAYMAtAIi56ngAAIoNmADAA5gDQBqYB8AfmAVACIGADTACABkwCoAtAwCCCAAcHAAJgCYCcYCeARGAIgEBgAwE2BAbIwpMA3MKgBVzEpCrU3oo69MRiApjBjwCIwIYAsMCHAKzAbAC0gAGTAEABwWAJYdAoAMp9MVeq0lrQa7w+RcpLC5iXH8hB+FyxmpK/l08Xj5dPHC6cL0xPKPnT8uzKd////IqWhcwub5KYubjLfJEc8jiF8ZUZUXMMySlQzIuQXMSo/8liExcw/8fyEIXksLmJUXKP2P6FcehmRcpESOGZE5AOAoGBE+FBII2GgIBDLVUfMjkW6NyexYyQKZrN1YexCWzLkmssZgmWX2lTlWNWdRJ0GuQlk8BuHJ//zosQqQAPuJAJ/pt6TyfGcfx/3Ha2yNna71N1A1B0HEVFBENEHFAEVErFSJjopqnRnctd6604J10WbsYDgPzAGABCAcjB4BJMUshgx+xEjD1VCNVkbYyBRlDCWCbHAIAwBgqAREQDpcBL9NdpbX3Lcd+3/h+HCKE4TBgXDxoYF8vnT5uZrWmggggpmZS63TTd1sgqykGQN0003ejsprv1rRdKirosk6KlUbsmYk6Q0qqqpmhs7rMj7JpVzUzNDZJy6enqNSJYpn0ltTLp5EyMD5TNTEtm5QIGByWGxEENkAmZqQDzLlNDUmlZExvssuiFnW01lnZu1f3jytUUBSJLOoBi5QCARZIskAQEYFAhgEAGAQIBACYAAJZEsiAgCWhLipgqauU5UPXYyuVCSXhAAFMBgQwKBDBYM//OgxFc/g+4Qqk8a3DBoKMHg4weEDB4SMKhgw+JDDAhMPBsw0IzEgbMRDkxwBxgqmpiqabVBqXLHfzcamXJjAVBhDKwIqNTpm8B2a9LVjNLS79I2dJ1OdRLtnW7Mks49bLdKtbJMySClvNakVOktFBF0qVVaF0PUtN1My1qqWp1zySdziztJaJ41vXSzAnmpqYmpqY0lKUk/e70jYyLxeNS6SpRVRUdJYmjQCdDDjaUppT4SsUCJYwIdPCrU48gFZlpR4pqKZLjCuivnzm2MSZOoiEfDXbMppFzDkVD5DJ3NaUCpR7c8YXhwH+7ZFYpUewnO1KB8dcZUKA3FljPM9kg2jvGkYbwdBAS7l2FgIOqmN2vMsPOWC81CxOozFkhi0kdOIjrJZoyhkJmZSJixtIuZNwJbpslcNv/zosSFOKQV6UhL0txIhQmYhlWmFk3MQImbRScQokRNKK65hG61O22pJeDmkjTB+RjmCc8WRwKCI2gBomMuJyjCcGWtpk6pNZsliQouqrJwhcuecbYWAMmkRoCIyLo/3CpFCXmt1hcPTIVVSAIm8tmLKy7VERpVChZiIg0TNd3Z+ra3xwn/UFYUvZwYuw11Yk/TotNbsoNGGdRNYWBF3RtrssfVxV5LWYCyV4mXM9WNDbEWyJjP2oC3iCZ5EEysS8U6WjF4lgwMFNsDJVQBwklQUlDkgchi86YrayqfhmHaR/rzRkvPcta508dE6x09vLUIQjZbRc9vs1rU5LLUerXZHEReq1y5sx62upnYBCLTLg5DslvzRKLVUx9hy4ZPklTba22py6VQaqDIrI1rUIkqTpUOSsSSkDY7//OgxM9AtBW9QE4Y3CaHQHoiUqrQlFpoyd3l0ZyiXfVMqZJJ7YeRFu6Vj45ElEZDyqrQ6fWpj6xyewGSGiHIdnlMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zosQAAAADSAAAAABMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"

main()

