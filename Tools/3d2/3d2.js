class mat4 extends Float32Array{
    constructor(){
        super(16)
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

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix")
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix")
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

var triangleVertexPositionBuffer
var squareVertexPositionBuffer
function initBuffers(){
    triangleVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
    var vertices =[
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    triangleVertexPositionBuffer.itemSize = 3
    triangleVertexPositionBuffer.numItems = 3

    squareVertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
    vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    squareVertexPositionBuffer.itemSize = 3
    squareVertexPositionBuffer.numItems = 4
}

var mvMatrix = new mat4()
var pMatrix = new mat4()
function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}

function drawScene(){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    pMatrix.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0)
    
    mvMatrix.identity()
    mvMatrix.translate([-1.5, 0.0, -7.0])
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
    triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems)

    mvMatrix.translate([3.0, 0.0, 0.0])
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
    setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems)
}

function webGLStart(){
    var canvas = document.getElementById("c3d")
    initGL(canvas)
    initShaders()
    initBuffers()

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    drawScene()
}