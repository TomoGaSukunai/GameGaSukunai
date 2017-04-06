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


function initBlocks(gl, attribs, uniforms){
    var CubeMath = require("./cube-math")
    var quad_indices = [0,2,1,0,3,2]
    var conner_indices = [
        0,1,2, 0,2,3,
        0,3,4, 0,4,5,
        0,5,6, 0,6,1,
        ]
    var realCubeColors = [[1,0.3,0],[1,1,1],[0,0.5,0],[1,0,0],[1,1,0],[0,0,1]]
    var Blocks = []

    for (var i in CubeMath.vertices_f){
        var offset = 0
        var vertices = []
        var colors = []
        var indices = []
        var fs = CubeMath.vertices_f[i];
        var vv = []
        var v0 = CubeMath.vertices[i].toArray()
        var sv = v0.map(x=>x*0.1)
        for (var j=0; j<3; j++){        
            vv[4*j] = v0
            var faceArray = CubeMath.faces[fs[j]].toArray()
            vv[4*j+1] = faceArray
            vv[4*j+2] = faceArray
            vv[4*j+3] = faceArray
            indices.push(quad_indices.map(i=>i+offset))
            offset += 4
            var c = realCubeColors[fs[j]] //getColorByVec3(faceArray)
            colors.push(c,c,c,c)//...quad_indices.map(x=>c))
        }
        for (var j=0; j<3; j++){        
            vv[4*j+1] = vv[4*j+1].map((x,k)=>x+vv[4*((j+2)%3)+2][k])
            vv[4*j+3] = vv[4*j+3].map((x,k)=>x+vv[4*((j+1)%3)+2][k])
        }

        vv.push([0,0,0])
        for (var j=0; j<3;j++){
            vv.push(vv[4*j+1])
            vv.push(vv[4*j+2])        
        }   
            
        indices.push(conner_indices.map(i=>i+offset))
        offset += 7
        var c = [0.4,0.4,0.4]
        colors.push(c,c,c,c,c,c,c)
        
        vv = vv.map(v=>v.map((k,i)=>k + sv[i]))
        
        vertices.push(...vv)
        vertices = vertices.reduce((a,b)=>[...a,...b])
        indices = indices.reduce((a,b)=>[...a,...b])
        colors = colors.reduce((a,b)=>[...a,...b])

        var f0 = CubeMath.faces[fs[0]].toArray()
        var Block = new Object3D(gl, indices, vertices, colors, "Block" + idx, attribs, uniforms)
        Block.init()
        
        Blocks.push(Block)
    }
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
    

    var Blocks = initBlocks(gl, attribs, {LMatrix: uniforms.LMatrix})
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