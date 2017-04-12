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

    // shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor")
    // gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)

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


// var pyramidVertexPositionBuffer
// var pyramidVertexColorBuffer
var cubeVertexPositionBuffer
// var cubeVertexColorBuffer
var cubeVertexIndexBuffer
var cubeVertexTexturCoordBuffer
function initBuffers(){
    // pyramidVertexPositionBuffer = gl.createBuffer()
    // gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer)
    // var vertices =[
    //      0.0,  1.0,  0.0,
    //     -1.0, -1.0,  1.0,
    //      1.0, -1.0,  1.0,

    //      0.0,  1.0,  0.0,
    //      1.0, -1.0,  1.0,
    //      1.0, -1.0, -1.0,

    //      0.0,  1.0,  0.0,
    //      1.0, -1.0, -1.0,
    //     -1.0, -1.0, -1.0,

    //      0.0,  1.0,  0.0,
    //     -1.0, -1.0, -1.0,
    //     -1.0, -1.0,  1.0,
    // ]
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    // pyramidVertexPositionBuffer.itemSize = 3
    // pyramidVertexPositionBuffer.numItems = 12

    // pyramidVertexColorBuffer = gl.createBuffer()
    // gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer)
    // var colors =[
    //     1.0, 0.0, 0.0, 1.0,
    //     0.0, 1.0, 0.0, 1.0,
    //     0.0, 0.0, 1.0, 1.0,

    //     1.0, 0.0, 0.0, 1.0,
    //     0.0, 0.0, 1.0, 1.0,
    //     0.0, 1.0, 0.0, 1.0,

    //     1.0, 0.0, 0.0, 1.0,
    //     0.0, 1.0, 0.0, 1.0,
    //     0.0, 0.0, 1.0, 1.0,

    //     1.0, 0.0, 0.0, 1.0,
    //     0.0, 0.0, 1.0, 1.0,
    //     0.0, 1.0, 0.0, 1.0,
    // ]
    
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    // pyramidVertexColorBuffer.itemSize = 4
    // pyramidVertexColorBuffer,numItems = 12

    cubeVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
    var vertices = [
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    cubeVertexPositionBuffer.itemSize = 3
    cubeVertexPositionBuffer.numItems = 24

    // cubeVertexColorBuffer = gl.createBuffer()
    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer)
    // colors = [
    //     1.0, 0.0, 0.0, 1.0,
    //     1.0, 0.0, 0.0, 1.0,
    //     1.0, 0.0, 0.0, 1.0,
    //     1.0, 0.0, 0.0, 1.0,

    //     1.0, 1.0, 0.0, 1.0,
    //     1.0, 1.0, 0.0, 1.0,
    //     1.0, 1.0, 0.0, 1.0,
    //     1.0, 1.0, 0.0, 1.0,
        
    //     0.0, 1.0, 0.0, 1.0,
    //     0.0, 1.0, 0.0, 1.0,
    //     0.0, 1.0, 0.0, 1.0,
    //     0.0, 1.0, 0.0, 1.0,
        
    //     1.0, 0.5, 0.5, 1.0,
    //     1.0, 0.5, 0.5, 1.0,
    //     1.0, 0.5, 0.5, 1.0,
    //     1.0, 0.5, 0.5, 1.0,
        
    //     1.0, 0.0, 1.0, 1.0,
    //     1.0, 0.0, 1.0, 1.0,
    //     1.0, 0.0, 1.0, 1.0,
    //     1.0, 0.0, 1.0, 1.0,
        
    //     0.0, 0.0, 1.0, 1.0,
    //     0.0, 0.0, 1.0, 1.0,
    //     0.0, 0.0, 1.0, 1.0,
    //     0.0, 0.0, 1.0, 1.0,
    // ]
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    // cubeVertexColorBuffer.itemSize = 4
    // cubeVertexColorBuffer.numItems = 24

    cubeVertexIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
    var cubeVertexIndices = [
        0,1,2, 0,2,3,
        4,5,6, 4,6,7,
        8,9,10, 8,10,11,
        12,13,14, 12,14,15,
        16,17,18, 16,18,19,
        20,21,22, 20,22,23,
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW)
    cubeVertexIndexBuffer.itemSize = 1
    cubeVertexIndexBuffer.numItems = 36

    cubeVertexTexturCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexturCoordBuffer)
    var textureCoords =[
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
    cubeVertexTexturCoordBuffer.itemSize = 2
    cubeVertexTexturCoordBuffer.numItems = 24
}

var neheTexture
function initTexture(){
    neheTexture = gl.createTexture()
    neheTexture.image = new Image()
    neheTexture.image.onload = function(){
        handleLoadedTexture(neheTexture)
        textureReady = true
    }
    neheTexture.image.src = "nehe.gif"
}
var textureReady = false

function handleLoadedTexture(texture){
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
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

var xRot = 0
var yRot = 0
var zRot = 0
function drawScene(){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    pMatrix.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
    
    mvMatrix.identity()
    // mvMatrix.translate([-1.5, 0.0, -7.0])


    // mvPushMatrix()
    // mvMatrix.rotate(degToRad(rPramid), [0, 1, 0])

    // gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer)
    // gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
    // pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    // gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer)
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
    // pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

    // setMatrixUniforms()
    // gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems)

    // mvPopMatrix()

    mvMatrix.translate([0.0, 0.0, -5.0])
    // mvPushMatrix()
    mvMatrix.rotate(degToRad(xRot), [1, 0, 0])
    mvMatrix.rotate(degToRad(yRot), [0, 1, 0])
    mvMatrix.rotate(degToRad(zRot), [0, 0, 1])
    


    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer)
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
    // cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexturCoordBuffer)
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
    cubeVertexTexturCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, neheTexture)
    gl.uniform1i(shaderProgram.samplerUniform, 0)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
    setMatrixUniforms()
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)

    // mvPopMatrix()
}

var lastTime = 0
function animate(){
    var now = Date.now()
    if (lastTime !== 0){
        var elapsed = now - lastTime

        // rPramid += (90 * elapsed) / 1000.0
        // rCube -= (75 * elapsed) / 1000.0
        xRot += (90 * elapsed) / 1000.0
        yRot += (90 * elapsed) / 1000.0
        zRot += (90 * elapsed) / 1000.0        
    }
    lastTime = now
}

function tick(){
    requestAnimationFrame(tick)

    //as async load texture, avoiding warning before texture loaded
    if (!textureReady){
        return
    }

    drawScene()
    animate()
}

function webGLStart(){
    var canvas = document.getElementById("c3d")
    initGL(canvas)
    initShaders()
    initBuffers()
    initTexture()

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    tick()
}
