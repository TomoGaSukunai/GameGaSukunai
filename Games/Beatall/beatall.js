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
    constructor(){
        this.pop = false
        this.startpop = Date.now()
    }
    isPoping(){
        return this.pop
    }
    pop(object){
        this.startpop = Date.now()
        this.pop = true        
    }
}
var theHoles = []


var gameLayer = new CopyCanvasLayer(canvas)
gameLayer.state = {
    holes: theHoles
}
gameLayer.drawHole = function(hole){

}
gameLayer.render = function(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
    for (var hole of this.holes){
        this.drawHole(hole)
    }    
}



var animation
var stopFlag = false
function main(){
    var animation = requestAnimationFrame(main)
    stopFlag && cancelAnimationFrame(animation)
}
