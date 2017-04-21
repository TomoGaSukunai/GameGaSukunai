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
    multiply(b){
        var a = this.copy()

        for (var i=0; i<4; i++){
            for(var j=0; j<4; j++){
                this[i*4+j] = 0
                for(var k=0; k<4; k++){
                    this[i*4+j] += a[k*4+j]*b[i*4+k]
                }
            }
        }
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

var currentProgram
function initShaders(){
    currentProgram = createProgram("shader-fs", "shader-vs")
}

function createProgram(fs_id, vs_id){
    var fragmentShader = getShader(gl, fs_id)
    var vertexShader = getShader(gl, vs_id)

    var shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    //gl.useProgram(shaderProgram)

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition")
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord")
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute)

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal")
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute)

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix")
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix")
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix")

    shaderProgram.colorMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uColorMapSampler")
    shaderProgram.specularMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uSpecularMapSampler")
    
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor")        
    shaderProgram.pointlightLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation")
    shaderProgram.pointlightSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor")
    shaderProgram.pointlightDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor")
    
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting")
    shaderProgram.useColorMapUniform = gl.getUniformLocation(shaderProgram, "uUseColorMap")
    shaderProgram.useSpecularMapUniform = gl.getUniformLocation(shaderProgram, "uUseSpecularMap")
    
    return shaderProgram;
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

var earthTexture
var specularTexture
function initTexture(){

    earthTexture = gl.createTexture()
    earthTexture.image = new Image()
    earthTexture.image.onload = function(){
        handleLoadedTexture(earthTexture)
        textureReady++
    }    
    earthTexture.image.src = "earth.jpg"

    specularTexture = gl.createTexture()
    specularTexture.image = new Image()
    specularTexture.image.onload = function(){
        handleLoadedTexture(specularTexture)
        textureReady++ 
    }
    specularTexture.image.src = "specular.gif"
}
var textureReady = 0

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
    gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix)

    var normalMatrix = new mat3()
    normalMatrix.fromInverseMat4(mvMatrix)
    normalMatrix.transpose()

    gl.uniformMatrix3fv(currentProgram.nMatrixUniform, false, normalMatrix)
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

var sphereVertexNormalBuffer
var sphereVertexPositionBuffer
var sphereVertexTextureCoordBuffer
var sphereVertexIndexBuffer

function initBuffer(){
    var latitudeMesh = 30
    var longitudeMesh = 30
    var radius = 10
    
    var vertexPositions = []
    var vertexNormals = []
    var textureCoords =[]
    var vertexCount = 0
    for (var i=0; i<=latitudeMesh; i++){
        var theta = Math.PI * i / latitudeMesh
        var ct = Math.cos(theta)
        var st = Math.sin(theta)
        for(var j=0; j<=longitudeMesh; j++){
            var phi = Math.PI * 2 * j / longitudeMesh
            var cp = Math.cos(phi)
            var sp = Math.sin(phi)

            var x = st * cp
            var y = ct           
            var z = st * sp
            vertexNormals.push(x, y, z)
            vertexPositions.push(x*radius, y*radius, z*radius)
            textureCoords.push(1 - j/longitudeMesh, 1 - i/latitudeMesh)
            vertexCount ++
        }
    }

    var indices = []
    for (var i=0; i<latitudeMesh; i++){
        for (var j=0; j<longitudeMesh; j++){
            var top = i * (longitudeMesh + 1) + j 
            var bottom = (i + 1) * (longitudeMesh + 1) + j
            indices.push(top, bottom, top + 1)
            indices.push(bottom, bottom + 1, top + 1)
        }
    }

    sphereVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW)
    sphereVertexPositionBuffer.itemSize = 3
    sphereVertexPositionBuffer.numItems = vertexCount

    sphereVertexNormalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW)
    sphereVertexNormalBuffer.itemSize = 3 
    sphereVertexNormalBuffer.numItems = vertexCount

    sphereVertexTextureCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
    sphereVertexTextureCoordBuffer.itemSize = 2
    sphereVertexTextureCoordBuffer.numItems = vertexCount

    sphereVertexIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    sphereVertexIndexBuffer.itemSize = 1
    sphereVertexIndexBuffer.numItems = indices.length
}

function drawScene(){        
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    pMatrix.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
    
    gl.useProgram(currentProgram);

    var specular = document.getElementById("specular").checked
    gl.uniform1i(currentProgram.useSpecularMapUniform, specular)

    var colormap = document.getElementById("colormap").checked
    gl.uniform1i(currentProgram.useColorMapUniform, colormap)

    var lighting = document.getElementById("lighting").checked
    gl.uniform1i(currentProgram.useLightingUniform, lighting)
 
    if (lighting){
        gl.uniform3f(
            currentProgram.ambientColorUniform,
            parseFloat(document.getElementById("ambientR").value),
            parseFloat(document.getElementById("ambientG").value),
            parseFloat(document.getElementById("ambientB").value)
        )

        gl.uniform3f(
            currentProgram.pointlightLocationUniform,
            parseFloat(document.getElementById("lightPositionX").value),
            parseFloat(document.getElementById("lightPositionY").value),
            parseFloat(document.getElementById("lightPositionZ").value)
        )

        gl.uniform3f(
            currentProgram.pointlightSpecularColorUniform,
            parseFloat(document.getElementById("specularR").value),
            parseFloat(document.getElementById("specularG").value),
            parseFloat(document.getElementById("specularB").value)
        )

        gl.uniform3f(
            currentProgram.pointlightDiffuseColorUniform,
            parseFloat(document.getElementById("diffuseR").value),
            parseFloat(document.getElementById("diffuseG").value),
            parseFloat(document.getElementById("diffuseB").value)
        )
    }

    mvMatrix.identity()    
    mvMatrix.translate([0.0, 0.0, -40.0])

    mvMatrix.rotate(degToRad(23.4), [1.0, 0.0, -1.0])
    mvMatrix.rotate(degToRad(teapotAngle), [0.0, 1.0, 0.0])
    

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, earthTexture)
    gl.uniform1i(currentProgram.colorMapSamplerUniform, 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, specularTexture)
    gl.uniform1i(currentProgram.specularMapSamplerUniform, 1)

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer)
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute,
    sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer)
    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute,
    sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer)
    gl.vertexAttribPointer(currentProgram.textureCoordAttribute,
    sphereVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer)
    setMatrixUniforms()

    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
}

var mouseDown = false
var lastX = null
var lastY = null 

var moonRotationMatrix = new mat4()
moonRotationMatrix.identity()
function handleMouseDown(e){
    mouseDown = true
    lastX = e.clientX
    lastY = e.clientY
}
function handleMouseUp(e){
    mouseDown = false
}
function handleMouseMove(e){
    if (!mouseDown){
        return
    }
    var newX = e.clientX
    var newY = e.clientY

    var deltaX = newX - lastX
    var newRotationMatrix = new mat4()
    newRotationMatrix.identity()
    newRotationMatrix.rotate(degToRad(deltaX / 10), [0.0,1.0,0.0])

    var deltaY = newY - lastY
    newRotationMatrix.rotate(degToRad(deltaY / 10), [1.0,0.0,0.0])
    newRotationMatrix.multiply(moonRotationMatrix)
    moonRotationMatrix = newRotationMatrix
    lastX = newX
    lastY = newY
}

var teapotAngle = 0

var lastTime = 0
function animate(){
    var now = Date.now()
    if(lastTime != 0){
        var elapsed = now - lastTime

        teapotAngle += 0.05 * elapsed        
    }
    lastTime = now 
}

function tick(){
    requestAnimationFrame(tick)

    //as async load texture, avoiding warning before texture loaded
    if (textureReady != 2){
        return
    }
    drawScene()
    animate()
}

function webGLStart(){
    var canvas = document.getElementById("c3d")
    initGL(canvas)
    initShaders()
    initTexture()
    initBuffer()

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    //canvas.onmousedown = handleMouseDown
    //document.onmouseup = handleMouseUp
    //document.onmousemove = handleMouseMove

    tick()
}
