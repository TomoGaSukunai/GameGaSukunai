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

function initTexture(gl, src){
    var myTexture = gl.createTexture()
    myTexture.image = new Image()
    myTexture.image.onload = function(){
        handleLoadedTexture(gl, myTexture)
    }
    myTexture.image.src = src
    return myTexture
}
function handleLoadedTexture(gl, texture){
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.bindTexture(gl.TEXTURE_2D, null)
}

function initBlocks(gl, attribs, uniforms){
    var CubeData = require("./cube-data")
    var quad_indices = [0,2,1,0,3,2]
    var conner_indices = [
        0,1,2, 0,2,3,
        0,3,4, 0,4,5,
        0,5,6, 0,6,1,
        ]
    var realCubeColors = [[1,0.3,0],[1,1,1],[0,0.5,0],[1,0,0],[1,1,0],[0,0,1]]
    var Blocks = []

    for (var i in CubeData.vertices_f){
   var vertices = []
        var colors = []
        var indices = []
        var v0 = CubeData.vertices[i]
        //create 3 outer faces
        for (var j=0; j<3; j++){
            //
            indices.push(CubeData.quad_indices.map(k=>k+vertices.length))
            //
            var face = CubeData.faces[CubeData.vertices_f[i][j]]
            var face_prev = CubeData.faces[CubeData.vertices_f[i][(j+2)%3]]
            var face_next = CubeData.faces[CubeData.vertices_f[i][(j+1)%3]]
            vertices.push(v0)
            vertices.push(face.map((x,k)=>x+face_prev[k]))
            vertices.push(face)
            vertices.push(face.map((x,k)=>x+face_next[k]))            
            //with color of face
            var c = CubeData.faces_color[CubeData.vertices_f[i][j]]
            colors.push(c,c,c,c)
        }
        // create inner faces
        //
        indices.push(CubeData.conner_indices.map(k=>k+vertices.length))
        //
        vertices.push([0,0,0])
        for (var j=0; j<3;j++){
            vertices.push(vertices[4*j+1])
            vertices.push(vertices[4*j+2])        
        }
        //
        var c = [0.9,0.9,0.9]
        colors.push(c,c,c,c,c,c,c)
        
        //move block a bit away from origin point
        vertices = vertices.map(v=>v.map((k,i)=>k + v0[i]*0.1))

        //
        vertices = vertices.reduce((a,b)=>[...a,...b])
        indices = indices.reduce((a,b)=>[...a,...b])
        colors = colors.reduce((a,b)=>[...a,...b])


        var Block = new Object3D(gl, indices, vertices, colors, "Block" + i, attribs, uniforms)
        Block.init()
        
        Blocks.push(Block)
    }
    return Blocks
}

function initBox(gl, attribs, uniforms, shaderProgram){
    var vertices = [1,0,0, 0,1,0, 0,0,1]
    var textureCoord = [1,0, 0,1, 0,0]
    var colors = [1,0,0, 0,1,0 ,0,0,1]
    var indices = [0,1,2]
    var neheTexture = initTexture(gl, "nehe.gif")
    var Box = new Object3D(gl, indices, vertices, neheTexture, textureCoord, "Box", attribs, uniforms, shaderProgram)
    Box.init()

    return Box
}



function draw(gl, canvas, uniforms, project_matrix, view_matrix, move_matrix, Box,
    shaderProgram, neheTexture){

    return function render(){
        //clear viewport and prepare to render 
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.enable(gl.DEPTH_TEST)
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        //use global projection and niewport, movement
        gl.uniformMatrix4fv(uniforms.Pmatrix, false, project_matrix.array)
        gl.uniformMatrix4fv(uniforms.Vmatrix, false, view_matrix.array)
        gl.uniformMatrix4fv(uniforms.Mmatrix, false, move_matrix.array)

        //draw objects
        Box.draw()
        requestAnimationFrame(render)
    }
    
}

function main(){
    var canvas = document.getElementById("gaming")
    var gl = initGL(canvas)

    var vertSource = document.getElementById("shader-vs").text
    var fragSource = document.getElementById("shader-fs").text
    var shaderProgram = initShaders(gl, vertSource, fragSource)
    
    var attribs = getAttribLocations(gl, shaderProgram, 
        ["coordinates", "textureCoordinates"])
    var uniforms = getUniformLocations(gl, shaderProgram, 
        ["Pmatrix", "Vmatrix", "Mmatrix", "Lmatrix"])
    

    var neheTexture = initTexture(gl, "nehe.gif")
    var view_matrix = $MAT4.createView()
    var project_matrix = $MAT4.createProjection()
    var move_matrix = $MAT4.create()


    var Box = initBox(gl, attribs, {Lmatrix: uniforms.Lmatrix}, shaderProgram)
    
    //var Blocks = initBlocks(gl, attribs, {Lmatrix: uniforms.Lmatrix})
    // Blocks.draw = function(){
    //     for(var Block of Blocks){
    //         Block.draw()
    //     }
    // }
    
    draw(gl,canvas, uniforms,project_matrix, view_matrix, move_matrix, Box)()
}


class Object3D{
    constructor(gl, indices, vertices, texture, textureCoord, name ,attribs, uniforms, shaderProgram){
        this.gl = gl
        this.indices = indices
        this.vertices = vertices
        this.texture = texture
        this.textureCoord = textureCoord
        this.name = name
        this.attribs = attribs
        this.uniforms = uniforms
        this.shaderProgram = shaderProgram
    }
    init(){
        let gl = this.gl
        this.move_matrix = $MAT4.create()
        
        this.vertex_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        this.textureCoord_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoord_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoord), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        this.index_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    }
    draw(){
        let gl = this.gl
        gl.uniformMatrix4fv(this.uniforms.Lmatrix, false, this.move_matrix.array)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer)
        gl.vertexAttribPointer(this.attribs.coordinates, 3, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoord_buffer)
        gl.vertexAttribPointer(this.attribs.textureCoordinates, 2, gl.FLOAT, false, 0, 0)
        
        
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(this.shaderProgram.samplerUniform, 0)

        //gl.drawArrays(gl.POINTS, 0, 1)
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)
    }
}

main()
