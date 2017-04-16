class mat4 extends Float32Array{
    constructor(...p){
        if (p.length === 0){
            super(16)
        }else {
            super(...p)
        }
    }
    perspective(angle, ratio, zMin, zMax){
        let ang = Math.tan(angle * Math.PI / 360);
        this[0] = 1/ang
        this[1] = 0
        this[2] = 0
        this[3] = 0

        this[4] = 0
        this[5] = ratio/ang
        this[6] = 0
        this[7] = 0
        
        this[8] = 0
        this[9] = 0        
        this[10] = -(zMax+zMin)/(zMax-zMin)
        this[11] = -1.0
        
        this[12] = 0
        this[13] = 0
        this[14] = -2*(zMax*zMin)/(zMax-zMin)
        this[15] = 0
    }
    identity(){
        this[0] = 1
        this[1] = 0
        this[2] = 0
        this[3] = 0

        this[4] = 0
        this[5] = 1
        this[6] = 0
        this[7] = 0
        
        this[8] = 0
        this[9] = 0        
        this[10] = 1
        this[11] = 0
        
        this[12] = 0
        this[13] = 0
        this[14] = 0
        this[15] = 1
    }
    translate(vec){                
        let x=vec[0], y=vec[1], z=vec[2]
        this[12]+=this[0]*x+this[4]*y+this[8]*z
        this[13]+=this[1]*x+this[5]*y+this[9]*z
        this[14]+=this[2]*x+this[6]*y+this[10]*z
        this[15]+=this[3]*x+this[7]*y+this[11]*z
    }
    rotate(rad, axis){        
        //judge vec and normalization
        let m = Math.sqrt(axis.reduce((a,b)=>a+b*b,0))
        // if (m == 0){
        //     return null
        // }
        if (m !== 1.0){
            m = 1.0/m
        }
        let naxis = axis.map(x=>x*m)
        // basic rotate coeffient
        let s = Math.sin(rad), c = Math.cos(rad)        
        
        // let xx = x * x * (1-c) + c
        // let yx = y * x * (1-c) + z * s 
        // let zx = z * x * (1-c) - y * s

        // let xy = x * y * (1-c) - z * s
        // let yy = y * y * (1-c) + c
        // let zy = z * y * (1-c) + x * s 
        
        // let xz = x * z * (1-c) + y * s
        // let yz = y * z * (1-c) - x * s
        // let zz = z * z * (1-c) + c
         
        let t = this.slice(0,12)
        let p = new Float32Array(3)

        for (let i=0; i<3; i++){
            for (let j=0, k=i; j<3; j++, k++){
                if (k == 3){
                    k = 0
                }
                switch (j){
                    case 0:
                        p[k] = c
                        break
                    case 1:
                        p[k] = s * naxis[(k+j)%3]
                        break
                    case 2:
                        p[k] = -s * naxis[(k+j)%3]
                        break
                }
                p[k] += naxis[i] * naxis[k] * (1-c)
            }
            for (let j=0; j<4; j++){
                this[i*4+j] = 0
                for (let k=0; k<3; k++){ 
                    this[i*4+j] += t[k*4+j] * p[k]
                }
            }
        }
    }
    copy(){
        return new mat4(this)
    }
}

class mat3 extends Float32Array{
    constructor(...p){
        if (p.length === 0){
            super(9)
        }else {
            super(...p)
        }
    }
    inverse(){
        let xx = this[0], xy = this[1], xz = this[2]
        let yx = this[3], yy = this[4], yz = this[5]
        let zx = this[6], zy = this[7], zz = this[8]
        let aa = xx * yy * zz + xy * yz * zx + xz * yx * zy
               - xx * yz * zy - xy * yx * zz - xz * yy * zx
        aa = 1.0/aa 
        this[0] = (yy * zz - yz * zy) * aa
        this[1] = (xz * zy - xy * zz) * aa
        this[2] = (xy * yz - xz * yy) * aa
        
        this[3] = (yz * zx - yx * zz) * aa
        this[4] = (xx * zz - xz * zx) * aa
        this[5] = (xz * yx - xx * yz) * aa
        
        this[6] = (yx * zy - yy * zx) * aa
        this[7] = (xy * zx - xx * zy) * aa
        this[8] = (xx * yy - xy * yx) * aa   
    }
    fromMat4(mat4){
        for (let i=0; i<3; i++){
            for(let j=0; j<3; j++){
                this[i*3+j] = mat4[i*4+j]
            }
        }
    }
    fromInverseMat4(mat4){
        this.fromMat4(mat4)
        this.inverse()
    }
    transpose(){
        for (let i=0; i<3; i++){
            for(let j=i+1; j<3; j++){
                let t = this[i*3+j]
                this[i*3+j] = this[i+3*j]
                this[i+3*j] = t
            }
        }
    }
}

class vec3 extends Float32Array{
    constructor(...p){
        if (p.length === 0){
            super(3)
        }else {
            super(...p)
        }
    }
    normalize(){
        var m = this.reduce((a,b)=>a+b*b,0)
        if (m !== 1.0){
            m = 1 / Math.sqrt(m)
            // for (var i in this){
            //     this[i] *= m
            // }
            this.scale(m)
        }
    }
    scale(k){
        for(var i in this){
            this[i] *= k
        }
    }
}

var gl
function initGL(canvas){
    try{
        gl = canvas.getContext("webgl")
        gl.viewportWidth = canvas.width
        gl.viewportHeight = canvas.height
    }catch(err){

    }
}

var shaderProgram
function initShaders(){
    var fragmentShader = getShader(gl, "shader-fs")
    var vertexShader = getShader(gl, "shader-vs")

    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    gl.useProgram(shaderProgram)

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition")
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord")
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute)

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix")
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix")
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler")    
}

function getShader(gl, id){
    var shaderScript = document.getElementById(id)
    var src = shaderScript.textContent
    var shader
    if (shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER)
    }else{
        shader = gl.createShader(gl.VERTEX_SHADER)
    }
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    return shader
}

var mudTexture
function initTexture(){

    mudTexture = gl.createTexture()
    mudTexture.image = new Image()
    mudTexture.image.onload = function(){
        handleLoadedTexture(mudTexture)
        textureReady = true
    }
    mudTexture.image.src = "mud.gif"
}
var textureReady = false

function handleLoadedTexture(texture){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
    gl.generateMipmap(gl.TEXTURE_2D)

    gl.bindTexture(gl.TEXTURE_2D, null)
}

var mvMatrix = new mat4()
var pMatrix = new mat4()
function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}

var mvMatrixStack = []
function mvPushMatrix(){
    mvMatrixStack.push(mvMatrix.copy())    
}
function mvPopMatrix(){
    mvMatrix = mvMatrixStack.pop()
}

function degToRad(degrees){
    return degrees * Math.PI / 180.0
}

var worldVertexPositionBuffer
var worldVertexTextureCoordBuffer
function loadWorld(){
    var vertexCount = 0
    var vertexPositions = []
    var vertexTextureCoords = []
    for (var i=0; i<world.length;){
        vertexPositions.push(world[i++])
        vertexPositions.push(world[i++])
        vertexPositions.push(world[i++])
        
        vertexTextureCoords.push(world[i++])
        vertexTextureCoords.push(world[i++])
        
        vertexCount += 1
    }
    worldVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer)    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW)
    worldVertexPositionBuffer.itemSize = 3
    worldVertexPositionBuffer.numItems = vertexCount

   
    worldVertexTextureCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW)
    worldVertexTextureCoordBuffer.itemSize = 2
    worldVertexTextureCoordBuffer.numItems = vertexCount

    document.getElementById("loadingtext").style.display = "none"
}

function drawScene(){        
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    pMatrix.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
    
    mvMatrix.identity()
    mvMatrix.rotate(degToRad(-pitch), [1.0, 0.0, 0.0])
    mvMatrix.rotate(degToRad(-yaw), [0.0, 1.0, 0.0])
    mvMatrix.translate([-xPos, -yPos, -zPos])

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, mudTexture)
    gl.uniform1i(shaderProgram.samplerUniform, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer)
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
    worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

    setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer.numItems)
}

var currentlyPressedKeys = {}
function handleKeyDown(event){
    currentlyPressedKeys[event.keyCode] = true
    if (String.fromCharCode(event.keyCode) == "F"){
        filter++
        if (filter == 3){
            filter = 0
        }
    }
}
function handleKeyUp(event){
    currentlyPressedKeys[event.keyCode] = false
}

var pitch = 0
var pitchRate = 0

var yaw = 0
var yawRate = 0

var xPos = 0
var yPos = 0.4
var zPos = 0
var speed = 0
function handleKeys(){
    pitchRate = 0
    if (currentlyPressedKeys[33]){
        //page up
        pitchRate = 0.1
    }
    if (currentlyPressedKeys[34]){
        //page down
        pitchRate = -0.1
    }

    yawRate = 0
    if (currentlyPressedKeys[37] || currentlyPressedKeys[65]){
        // left or A
        yawRate = 0.1
    }
    if (currentlyPressedKeys[39] || currentlyPressedKeys[68]){
        // right or D
        yawRate = -0.1
    }

    speed = 0
    if (currentlyPressedKeys[38] || currentlyPressedKeys[87]){
        // up or W
        speed = 0.003
    }
    if (currentlyPressedKeys[40] || currentlyPressedKeys[83]){
        speed = -0.003
    }    
}

var lastTime = 0
var joggingAngle = 0
function animate(){
    var now = Date.now()
    
    if (lastTime !== 0){
        var elapsed = now - lastTime
        if (speed !=0){
            xPos -= Math.sin(degToRad(yaw)) * speed * elapsed
            zPos -= Math.cos(degToRad(yaw)) * speed * elapsed

            joggingAngle += elapsed * 0.6
            yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
        }
        pitch += pitchRate * elapsed
        yaw += yawRate * elapsed

    }
    lastTime = now
}

function tick(){
    requestAnimationFrame(tick)

    //as async load texture, avoiding warning before texture loaded
    if (!textureReady){
        return
    }

    handleKeys()
    drawScene()
    animate()
}

function webGLStart(){
    var canvas = document.getElementById("c3d")
    initGL(canvas)
    initShaders()
    initTexture()
    loadWorld()

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    document.onkeydown = handleKeyDown
    document.onkeyup = handleKeyUp

    tick()
}