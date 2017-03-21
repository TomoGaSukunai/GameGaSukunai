var canvas = document.getElementById("gaming")
var ctx = canvas.getContext("2d")

//divide screen 
var timeArea = {
    x: 0,
    y: 0,
    w: 160,
    h: 160,
}
var numberArea = {
    x: 0,
    y: 160,
    w: 160,
    h: 160,
    font: ""
}
var boxArea = {
    x: 160,
    y: 0,
    w: 480,
    h: 480,

}

var dialogArea = {
    x: 120,
    y: 60,
    w: 360,
    h: 360,
    text: "Start your game",
    font: "80px Arial",
    style: "rgba(128,128,128,0.5)"
}

var buttonArea = {
    x: dialogArea.w/6 + dialogArea.x,
    y: dialogArea.h/8*6 + dialogArea.y,
    w: dialogArea.w/6 * 4,
    h: dialogArea.h/8,
    text: "START",
    font: "24px  Arial",
    style: "rgba(128,196,128,0.5)"
}

function randomFill25(){
    var r25 = []
    
    for (var i=0; i<25; i++){
        r25.push({val:Math.random(),idx:i})
    }
    r25.sort((a,b)=>a.val-b.val)
    var rr25 = []
    for (var i=0; i<25; i++){
        rr25[r25[i].idx] = i+1
    }
    return rr25
}

function draw25Boxes(fills, ctx, area){
    var gap = 10
    var w = (area.w - gap*4)/5
    var h = (area.h - gap*4)/5
    var idx = 0
    for (var i=0; i<5; i++){
        for(var j=0; j<5; j++){
            if (fills[idx] === 0) {
                idx++
                continue
            }
            ctx.beginPath()
            ctx.fillStyle = fills[idx] > 25? "#00bfff" : "#1e90ff"
            ctx.rect(area.x + i*(w+gap), area.y + j*(h+gap), w, h)
            ctx.fill()
            ctx.font = h + "px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = "white"            
            ctx.fillText(fills[idx++],area.x + i*(w+gap) + w/2, area.y + j*(h+gap)+ h/2,w-4)
        }
    }
}

function clearArea(ctx, area){
    ctx.clearRect(area.x, area.y, area.w, area.h)
}

function drawDialog(ctx, area){
    ctx.beginPath()
    ctx.rect(area.x, area.y, area.w, area.h)
    ctx.fillStyle = area.style
    ctx.fill()
    ctx.font = area.font
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "white"
    ctx.fillText(area.text, area.x + area.w/2, area.y+ area.h/2,area.w)
}

function drawNum(ctx, area, num){
    ctx.textAlign = "center"
    ctx.textBaseline = "top"    
    ctx.fillStyle = "green"
    ctx.fillText(num, area.x + area.w/2, area.y+10,area.w)
}

function drawTimer(ctx, area){
    var time = ((Date.now() - timeStamp)/1000).toFixed(2)
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = area.width/20 + "px Arial"
    ctx.fillStyle = "blue"
    ctx.fillText(time, area.x + area.w/2, area.y+10,area.w)
}

var clickState = {
    f: false,
    x: 0,
    y: 0,
}
function clickHandler(e){
    clickState.f = true    
    clickState.x = e.x / canvas.clientWidth * canvas.width
    clickState.y = e.y / canvas.clientHeight * canvas.height
}

var gamePhase = 0
var animation = null
var stopFlag = false
function main(){
    animation = requestAnimationFrame(main)
    stopFlag && cancelAnimationFrame(animation)
    //handler click 

    if (gamePhase == 0){
        clearArea(ctx, dialogArea)
        drawDialog(ctx, dialogArea)
        drawDialog(ctx, buttonArea)
        if (clickState.f){
            var xx = clickState.x 
            var yy = clickState.y

            if (xx > buttonArea.x && xx < buttonArea.x + buttonArea.w
            && yy > buttonArea.y && yy < buttonArea.y + buttonArea.h){
                clearArea(ctx, dialogArea)
                gameInit()                
            }
        }
    }else if (gamePhase == 1){
        if (clickState.f){
            var xx = Math.floor((clickState.x - boxArea.x)/boxArea.w *5)
            var yy = Math.floor((clickState.y - boxArea.y)/boxArea.h *5)        
            var ii = xx * 5 + yy
            if (fills_fore[ii] === aimNumber+1 ){
                aimNumber ++ 
                fills_fore[ii] = fills_back[ii]
                fills_back[ii] = 0
                //console.log(fills_fore[ii])
                clearArea(ctx, boxArea)
                draw25Boxes(fills_fore, ctx, boxArea)
            }
            //console.log(fills_fore[ii])
        }
        if (gamePhase == 1){
            clearArea(ctx, timeArea)
            drawTimer(ctx, timeArea)
            clearArea(ctx, numberArea)
            drawNum(ctx, numberArea, aimNumber)
        }
        if (aimNumber === 50){
            dialogArea.text = "your time : "+(((Date.now() - timeStamp)/1000).toFixed(2))
            buttonArea.text = "RESTART"
            gamePhase = 0
        }        
    }
    clickState.f = false
}

fills_fore = []
fills_back = []
aimNumber = 0
timeStamp = 0

function gamPlaying(){

}


function gameInit(){
    fills_fore = randomFill25()
    fills_back = randomFill25().map(x=>x+25)
    aimNumber = 0
    timeStamp = Date.now()
    gamePhase = 1
    draw25Boxes(fills_fore, ctx, boxArea)    
}

canvas.addEventListener("click", clickHandler)
main()