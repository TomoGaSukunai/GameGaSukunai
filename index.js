const fs = require("fs")
const path = require("path")
const remote = require("electron").remote

var LIST = {
    div: document.getElementById("mainList"),
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


var ignore = fs.readFileSync(path.join(__dirname, ".gitignore"),"utf8").split("\n")
var files = fs.readdirSync(path.join(__dirname, "Games"))
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
    LIST.addMessage("No Game Found", "err")
}else {
    for (var game of games){
        LIST.addGame(game)
    }
}

