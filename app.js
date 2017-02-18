const {app, BrowserWindow} = require("electron")
const path = require("path")

let mainWindow
app.on("ready",function(){
    global.mainWindow = mainWindow = new BrowserWindow({
        width: 640,
        height: 480,
        resizable: false,
        useContentSize: true,
    })
    
    mainWindow.loadURL(path.join(__dirname, "index.html"))
    //mainWindow.setMenu()
})
