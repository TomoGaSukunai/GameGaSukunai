const {$MAT4} = require("./matrix")

function initGL(canvas){
    var gl = canvas.getContext("webgl")

    return gl
}

function initShaders(gl, vertSource, fragSource){
    var vertShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertShader, vertSource)
    gl.compileShader(vertShader)

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragShader, fragSource)
    gl.compileShader(fragShader)

    var shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertShader)
    gl.attachShader(shaderProgram, fragShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    return shaderProgram
}

function getAttribLocations(gl, shaderProgram, attribs){
    var ret = {}
    for(var key of attribs){
        ret[key] = gl.getAttribLocation(shaderProgram, key)
        gl.enableVertexAttribArray(ret[key])
    }
    return ret
}
function getUniformLocations(gl, shaderProgram, uniforms){
    var ret = {}
    for(var key of uniforms){
        ret[key] = gl.getUniformLocation(shaderProgram, key)
    }
    return ret
}

function main(){
    var canvas = document.getElementById("gaming")
    var gl = initGL(canvas)

    var vertSource = document.getElementById("shader-vs").text
    var fragSource = document.getElementById("shader-fs").text
    var shaderProgram = initShaders(gl, vertSource, fragSource)
    
    var attribs = getAttribLocations(gl, shaderProgram, 
        ["coordinates", "color"])
    var uniforms = getUniformLocations(gl, shaderProgram, 
        ["Pmatrix", "Vmatrix", "Mmatrix", "Lmatrix"])    
}


class Object3D{
    constructor(gl, indices, vertices, colors, name ,attribs, uniforms){
        this.gl = gl
        this.indices = indices
        this.vertices = vertices
        this.colors = colors
        this.name = name
        this.attribs = attribs
        this.uniforms = uniforms
    }
    init(){
        let gl = this.gl
        this.move_matrix = $MAT4.create()
        
        this.vertex_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        this.color_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        this.index_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    }
    draw(){
        gl.uniformMatrix4fv(this.uniforms.LMatrix, false, this.move_matrix)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer)
        gl.vertexAttribPointer(this.attribs.coordinates, 3, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer)
        gl.vertexAttribPointer(this.attribs.color, 3, gl.FLOAT, false, 0, 0)
        
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)
    }
}