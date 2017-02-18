const {app, BrowserWindow} = require("electron")
const path = require("path")

let main
app.on("ready",function(){
    main = new BrowserWindow({
        width: 640,
        height: 480,
        resizable: false,
        useContentSize: true,
    })
    
    main.loadURL(path.join(__dirname, "index.html"))
})