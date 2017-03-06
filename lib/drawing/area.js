const Area = class{
    constructor(x,y,w,h){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
}
const CanvasArea = class{
    constructor(canvas){
        this.canvas = canvas    
    }
    getHoleArea(){
        return this.getSubArea(1,1,0,0)
        //return new Area(0, 0, canvas.width, canvas.height)
    }
    getSubArea(m,n,i,j){
        var w = this.canvas.width/m
        var h = this.canvas.height/n
        return new Area(w*i, h*j, w, h)
    }
    getCol(m,i){
        return this.getSubArea(m,1,i,0)
        // var w = this.canvas.width/m        
        // return new Area(w*i, 0, w, canvas.height)
    }
    getRow(n,j){
        return this.getSubArea(1,n,0,j)
        // var h = this.canvas.height/n
        // return new Area(0, h*j, canvas.width, h)
    }
    
}
module.exports = {Area, CanvasArea}