const fs = require("fs")
const path = require("path")
const remote = require("electron").remote

var gameList = {
    div: document.getElementById("gameList"),
    addGame(file){
        var button = document.createElement("button")
        button.textContent = file
        button.onclick = function(){
            let gameWin = new remote.BrowserWindow({
                width: 640,
                height: 480,
                resizable: false,
                useContentSize: true,
            })
            gameWin.loadURL(path.join(__dirname, "Games", file, "index.html"))
            gameWin.openDevTools()
        }
        this.div.appendChild(button)
    },
    addMessage(msg, type){
        var p = document.createElement("p")
        p.innerHTML = msg
        p.className = type
        this.div.appendChild(p)
    },
} 

var toolList = {
    div: document.getElementById("toolList"),
    addTool(file){
        var button = document.createElement("button")
        button.textContent = file
        button.onclick = function(){
            let gameWin = new remote.BrowserWindow({
                width: 640,
                height: 480,
                resizable: false,
                useContentSize: true,
            })
            gameWin.loadURL(path.join(__dirname, "Tools", file, "index.html"))
            gameWin.openDevTools()
        }
        this.div.appendChild(button)
    },
    addMessage(msg, type){
        var p = document.createElement("p")
        p.innerHTML = msg
        p.className = type
        this.div.appendChild(p)
    },
}

var ignore = fs.readFileSync(path.join(__dirname, ".gitignore"),"utf8").split("\n")
var files
try{
    files =  fs.readdirSync(path.join(__dirname, "Games"))
}catch(err){
    files = []
    console.log(err)
}
var games = []
for (var file of files){
    if (ignore.indexOf(file) === -1){
        var stat = fs.lstatSync(path.join(__dirname, "Games", file))
        if (stat.isDirectory()){
            games.push(file)
            console.log(file)
        }
    }
}

if (games.length === 0){
    gameList.addMessage("No Game Found", "err")
}else {
    for (var game of games){
        gameList.addGame(game)
    }
}
try{
    files = fs.readdirSync(path.join(__dirname, "Tools"))
}catch(err){
    files = []
    console.log(err)
}
var tools = []
for (var file of files){
    if (ignore.indexOf(file) === -1){
        var stat = fs.lstatSync(path.join(__dirname, "Tools", file))
        if (stat.isDirectory()){
            tools.push(file)
            console.log(file)
        }
    }
}

if (tools.length === 0){
    toolList.addMessage("No Tool Found", "err")
}else {
    for (var tool of tools){
        toolList.addTool(tool)
    }
}