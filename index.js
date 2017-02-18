const fs = require("fs")
const path = require("path")

var LIST = {
    div: document.getElementById("mainList"),
    addGame(file){

    },
    addMessage(msg, type){
        var p = document.createElement("p")
        p.innerHTML = msg
        p.className = type
        this.div.appendChild(p)
    },
} 


var ignore = fs.readFileSync(path.join(__dirname, ".gitignore"),"utf8").split("\n")
var files = fs.readdirSync(__dirname)
var games = []

for (var file of files){
    if (ignore.indexOf(file) !== -1){
        var stat = fs.lstatSync(path.join(__dirname, file))
        if (stat.isDirectory()){
            games.push(file)
            console.log(file)
        }
    }
}

if (games.length === 0){
    LIST.addMessage("No Game Found", "err")
}

