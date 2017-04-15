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

    // shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor")
    // gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord")
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute)

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal")
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute)    

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix")
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix")
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler")
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix")
    shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha")
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor")
    shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection")
    shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor")    
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting")
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
var cubeVertexNormalBuffer
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

    cubeVertexNormalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer)
    var vertexNormals =[
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
                 
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,    
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW)
    cubeVertexNormalBuffer.itemSize = 3
    cubeVertexNormalBuffer.numItems = 24
}

// var neheTexture
// var glassTextures = []
var glassTexture
function initTexture(){
    var glassImage = new Image()

    // for (var i=0; i<3; i++){
    //     var texture = gl.createTexture()
    //     texture.image = glassImage
    //     glassTextures.push(texture)
    // } 
    glassTexture = gl.createTexture()
    glassTexture.image = glassImage
    glassImage.onload = function(){
        handleLoadedTexture(glassTexture)
        textureReady = true
    }
    glassImage.src = "glass.gif"
}
var textureReady = false

function handleLoadedTexture(texture){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    // gl.bindTexture(gl.TEXTURE_2D, textures[0])
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0].image)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

    // gl.bindTexture(gl.TEXTURE_2D, textures[1])
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].image)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    
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

var xRot = 0
var xSpeed = 0
var yRot = 0
var ySpeed = 0
var zRot = 0

var z = -5.0
var filter = 0
function drawScene(){
    var blending = document.getElementById("blending").checked

    if (blending){
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
        gl.enable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
        gl.uniform1f(shaderProgram.alphaUniform, parseFloat(document.getElementById("alpha").value))
    }else{
        gl.disable(gl.BLEND)
        gl.enable(gl.DEPTH_TEST)
        gl.uniform1f(shaderProgram.alphaUniform, 1.0)
    }


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

    mvMatrix.translate([0.0, 0.0, z])
    // mvPushMatrix()
    mvMatrix.rotate(degToRad(xRot), [1, 0, 0])
    mvMatrix.rotate(degToRad(yRot), [0, 1, 0])
    // mvMatrix.rotate(degToRad(zRot), [0, 0, 1])
    


    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer)
    // gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
    // cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexturCoordBuffer)
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
    cubeVertexTexturCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
    cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, glassTexture)
    gl.uniform1i(shaderProgram.samplerUniform, 0)

    var lighting = document.getElementById("lighting").checked
    gl.uniform1i(shaderProgram.useLightingUniform, lighting)

    if (lighting){
        gl.uniform3f(
            shaderProgram.ambientColorUniform,
            parseFloat(document.getElementById("ambientR").value),
            parseFloat(document.getElementById("ambientG").value),
            parseFloat(document.getElementById("ambientB").value)
        )

        var lightingDirection = [        
            parseFloat(document.getElementById("lightDirectionX").value),
            parseFloat(document.getElementById("lightDirectionY").value),
            parseFloat(document.getElementById("lightDirectionZ").value),
        ]

        var adjustedLD = new vec3(lightingDirection)
        adjustedLD.normalize()
        adjustedLD.scale(-1)
        gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD)

        gl.uniform3f(
            shaderProgram.directionalColorUniform,
            parseFloat(document.getElementById("directionalR").value),
            parseFloat(document.getElementById("directionalG").value),
            parseFloat(document.getElementById("directionalB").value)
        )
    }

    var normalMatrix = new mat3()
    normalMatrix.fromInverseMat4(mvMatrix)
    normalMatrix.transpose()
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix)

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
        xRot += (xSpeed * elapsed) / 1000.0
        yRot += (ySpeed * elapsed) / 1000.0
        // zRot += (90 * elapsed) / 1000.0        
    }
    lastTime = now
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

function handleKeys(){
    if (currentlyPressedKeys[33]){
        //page up
        z -= 0.05
    }
    if (currentlyPressedKeys[34]){
        //page down
        z += 0.05
    }
    if (currentlyPressedKeys[37]){
        //left
        ySpeed -= 1
    }
    if (currentlyPressedKeys[39]){
        //right
        ySpeed += 1
    }
    if (currentlyPressedKeys[38]){
        //up
        xSpeed -= 1
    }
    if (currentlyPressedKeys[40]){
        //down
        xSpeed += 1
    }    
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
    initBuffers()
    initTexture()

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    document.onkeydown = handleKeyDown
    document.onkeyup = handleKeyUp

    tick()
}

