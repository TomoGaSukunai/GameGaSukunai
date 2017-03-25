
var canvas = document.getElementById("gaming")
var gl = canvas.getContext("webgl")



var bs = [-0.5,0.5]
var vertices0 = []
for(var x of bs){
    for(var y of bs){
        for(var z of bs){
            vertices0.push([x,y,z])
        }
    }
}


var faces = []
for(var b of bs){
    faces.push([b,0,0],[0,b,0],[0,0,b])
}


var vertices = []
var colors = []
var indices = []
for (var ii in faces){
    var face = faces[ii]
    var quad = []
    for (var i in vertices0){
        var vertex = vertices0[i]
        if (inner(vertex,face) >0){
            quad.push(parseInt(i))
        }
    }
    var v0 = quad[0]
    var v1,v2,v3
    var f0 = sub(vertices0[v0], face)
    for (idx of quad){
        if (idx === v0) continue
        var f = inner(face, outer(f0, sub(vertices0[idx],vertices0[v0])))
        if (f > 0){
            v1 = idx
        }else if (f == 0){
            v2 = idx
        }else if ( f < 0){
            v3 = idx
        }
    }
    color = face.map(x=>(x+0.5)*0.8)
    var offset = parseInt(ii) * 4
    indices.push([offset + 0 ,offset + 1,offset +2,offset +0,offset +2,offset +3])
    vertices.push(vertices0[v0],vertices0[v1],vertices0[v2],vertices0[v3])
    colors.push(color,color,color,color)
}
//indices =[[1,5,7,3]]

vertices = vertices.reduce((a,b)=>[...a,...b])
indices = indices.reduce((a,b)=>[...a,...b])
colors = colors.reduce((a,b)=>[...a,...b])
function outer(a,b){
    var c = []
    c[0] = a[1]*b[2] - a[2]*b[1]
    c[1] = a[2]*b[0] - a[0]*b[2]
    c[2] = a[0]*b[1] - a[1]*b[0]
    return c 
}
function inner(a,b){    
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
}
function sub(a,b){
    var c = []
    for (var i=0; i<3; i++){
        c[i] = a[i] - b[i]        
    }
    return c
}
function dst(a,b){
    var d = 0
    for (var i=0; i<3; i++){
        var t = (a[i] - b[i])
        d += t*t
    }
    return Math.sqrt(d)
}

var vertex_buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
//gl.bindBuffer(gl.ARRAY_BUFFER, null)

var color_buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
//gl.bindBuffer(gl.ARRAY_BUFFER, null)

var index_buffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)



var vertShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertShader, document.getElementById("shader-vs").text)
gl.compileShader(vertShader)

var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragShader, document.getElementById("shader-fs").text)
gl.compileShader(fragShader)

var shaderProgram = gl.createProgram()
gl.attachShader(shaderProgram, vertShader)
gl.attachShader(shaderProgram, fragShader)
gl.linkProgram(shaderProgram)

var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix")
var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix")
var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix")
//gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)


gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)

var coord = gl.getAttribLocation(shaderProgram, "coordinates")
gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(coord)

gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
var color = gl.getAttribLocation(shaderProgram, "color")
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(color)

gl.useProgram(shaderProgram)


function get_projection(angle, a, zMin, zMax){
    var ang = Math.tan((angle * 0.5)*Math.PI/180)
    return [
        0.5/ang,0,0,0,
        0,0.5/ang,0,0,
        0,0,-(zMax+zMin)/(zMax-zMin), -1,
        0,0,(-2*zMax*zMin)/(zMax-zMin),0,
    ]
}

var project_matrix = get_projection(40,canvas.width/canvas.height,1,100)
var move_matrix = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1,
]
var view_matrix = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1,
]
view_matrix[14] = view_matrix[14] - 6


function rotateZ(m, angle){
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];
    m[0] = c*m[0] - s*m[1]
    m[4] = c*m[4] - s*m[5]
    m[8] = c*m[8] - s*m[9]
    m[1] = c*m[1] + s*mv0
    m[5] = c*m[5] + s*mv4
    m[9] = c*m[9] + s*mv8   
}
function rotateX(m, angle){
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];
    m[1] = c*m[1] - s*m[2]
    m[5] = c*m[5] - s*m[6]
    m[9] = c*m[9] - s*m[10]
    m[2] = c*m[2] + s*mv1
    m[6] = c*m[6] + s*mv5
    m[10] = c*m[10] + s*mv9   
}

function rotateY(m, angle){
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mv2 = m[2], mv6 = m[6], mv10 = m[10];
    m[2] = c*m[2] - s*m[0]
    m[6] = c*m[6] - s*m[4]
    m[10] = c*m[10] - s*m[8]
    m[0] = c*m[0] + s*mv2
    m[4] = c*m[4] + s*mv6
    m[8] = c*m[8] + s*mv10   
}



gl.viewport(0, 0, canvas.width, canvas.height)
gl.enable(gl.DEPTH_TEST)
gl.clearColor(0.5, 0.5, 0.5, 0.9)
gl.clear(gl.COLOR_BUFFER_BIT)
//gl.drawArrays(gl.LINE_STRIP, 0, 6)

//rotateZ(move_matrix, 0.5)
rotateY(move_matrix, 0.5)
rotateX(move_matrix, 0.5)

gl.uniformMatrix4fv(Pmatrix, false, project_matrix)
gl.uniformMatrix4fv(Vmatrix, false, view_matrix)
gl.uniformMatrix4fv(Mmatrix, false, move_matrix)

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)

//gl.drawArrays(gl.POINTS, 0, 1)
//gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0)
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

