var Coder = require("./cube-coder")
var CubeMath = require("./cube-math")
var CubeSolver = require("./cube-data-init")
CubeSolver.init()

var canvas = document.getElementById("gaming")
var gl = canvas.getContext("webgl")

var quad_indices = [0,2,1,0,3,2]
var conner_indices = [
    0,1,2, 0,2,3,
    0,3,4, 0,4,5,
    0,5,6, 0,6,1,
    ]
var realCubeColors = [[1,0.3,0],[1,1,1],[0,0.5,0],[1,0,0],[1,1,0],[0,0,1]]
function getColorByVec3(vec3) {
    var fff = vec3.reduce((a,b)=>a+b)
    var c = vec3.map(x=>x)
    if (fff > 0 ){
        c = c.map(x=>(x-1)*-1.6)
    }else {
        c = c.map(x=>x*-1.6)
    }
    return c
}

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
    var Block = {vertices, indices, colors, v0, f0}
    Block.idx = i
    
    Blocks.push(Block)

}

function get_projection(angle, a, zMin, zMax){
    var ang = Math.tan((angle * 0.5)*Math.PI/180)
    return [
        0.5/ang,0,0,0,
        0,0.5*a/ang,0,0,
        0,0,-(zMax+zMin)/(zMax-zMin), -1,
        0,0,(-2*zMax*zMin)/(zMax-zMin),0,
    ]
}

var project_matrix = get_projection(40,canvas.width/canvas.height,1,100)
var view_matrix = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1,
]
view_matrix[14] = view_matrix[14] - 6
var move_matrix = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1,
]

for (var Block of Blocks){
    Block.move_matrix = move_matrix.map(x=>x)

    var vertex_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Block.vertices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    var color_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Block.colors), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    var index_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Block.indices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    Block.vertex_buffer = vertex_buffer
    Block.color_buffer = color_buffer
    Block.index_buffer = index_buffer
}

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
gl.useProgram(shaderProgram)

var coord = gl.getAttribLocation(shaderProgram, "coordinates")
gl.enableVertexAttribArray(coord)

var color = gl.getAttribLocation(shaderProgram, "color")
gl.enableVertexAttribArray(color)

var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix")
var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix")
var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix")
var Lmatrix = gl.getUniformLocation(shaderProgram, "Lmatrix")

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

var timeStamp = Date.now()
var rY = -0.5 
var rX = 0.5
var animation_que = []
var cubeStatus = Coder.getBytes(0)

function main(){

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    var now = Date.now()
    var dt = now - timeStamp
    timeStamp = now
    gl.uniformMatrix4fv(Pmatrix, false, project_matrix)
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix)
    
    //rotateY(move_matrix, 0.01*60/1000*dt)
    rotateY(move_matrix, rY)
    rotateX(move_matrix, rX)

    gl.uniformMatrix4fv(Mmatrix, false, move_matrix)
    
    rotateX(move_matrix, -rX)
    rotateY(move_matrix, -rY)
    
    if (keyState.f){
        var bool = true
        var axis = 0
        var rot = false
        if (animation_que.length == 0)
            rot = true
        switch(keyState.code){
            case "KeyQ": bool = false
            case "KeyA": axis = 0
                break
            case "KeyW": bool = false
            case "KeyS": axis = 1
                break
            case "KeyE": bool = false
            case "KeyD": axis = 2
                break
            case "KeyR": bool = false
            case "KeyF": axis = 3
                break
            case "KeyT": bool = false
            case "KeyG": axis = 4
                break
            case "KeyY": bool = false
            case "KeyH": axis = 5
                break
            case "ArrowLeft": 
                rY -= 0.1
                rot = false
                break
            case "ArrowRight":
                rY += 0.1
                rot = false
                break
            case "ArrowUp": 
                rX -= 0.1
                rot = false
                break
            case "ArrowDown":
                rX += 0.1
                rot = false
                break
            case "Space":
                recover()
                rot = false
                break
            default:{
                rot = false
                console.log(keyState.code)                
            }
        }    
        if(rot){
            rotateCubeAnimation(axis, bool)
        }else{
            //console.log(rX,rY)
        }
        keyState.f = false
    }    

    if (animation_que.length > 0){        
        if (animation_que[0](dt)){
            animation_que.splice(0,1)
        }
    }

    for(var idx in Blocks){
        //if (idx == 0 ) continue
        var Block = Blocks[idx]

        gl.uniformMatrix4fv(Lmatrix, false, Block.move_matrix)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Block.index_buffer)

        gl.bindBuffer(gl.ARRAY_BUFFER, Block.vertex_buffer)
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0)        

        gl.bindBuffer(gl.ARRAY_BUFFER, Block.color_buffer)       
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0)
        
        gl.drawElements(gl.TRIANGLES, Block.indices.length, gl.UNSIGNED_SHORT, 0)
    }

    requestAnimationFrame(main)
}

function rotateCube(i, b = true){
    var face = CubeMath.faces[i]
    var a = b ? -1:1
    var tBlocks = Blocks.map(x=>x);
    for(var maplet of CubeMath.mapping[i]){
        var src = b ? maplet[0] : maplet[1]
        var dst = b ? maplet[1] : maplet[0]
        var Block = Blocks[src]
        tBlocks[dst] = Blocks[src]
        rotateX(Block.move_matrix, Math.PI/2 * face.x*a)
        rotateY(Block.move_matrix, Math.PI/2 * face.y*a)
        rotateZ(Block.move_matrix, Math.PI/2 * face.z*a)
    }
    Blocks = tBlocks
    cubeStatus = mappingStatus(i,b,cubeStatus)
}

function rotateCubeAnimation(i, b = true){
    var f =  function(dt){        
        var face = CubeMath.faces[i]
        var t0 = 120
        var r = (b ? -1:1)/t0
        var t = t0
        return function(dt){
            var dt = Math.min(t, dt)
            t -= dt            
            for(var maplet of CubeMath.mapping[i]){
                var src = b ? maplet[0] : maplet[1]                
                var Block = Blocks[src]                
                rotateX(Block.move_matrix, Math.PI/2 * face.x*r*dt)
                rotateY(Block.move_matrix, Math.PI/2 * face.y*r*dt)
                rotateZ(Block.move_matrix, Math.PI/2 * face.z*r*dt)
            }
            if (t == 0){
                var tBlocks = Blocks.map(x=>x);
                for(var maplet of CubeMath.mapping[i]){
                    var src = b ? maplet[0] : maplet[1]
                    var dst = b ? maplet[1] : maplet[0]
                    tBlocks[dst] = Blocks[src]
                }
                Blocks = tBlocks
                cubeStatus = mappingStatus(i,b,cubeStatus)
                blocksCheck()
                return true
            }
            return false
        }
    }()
    animation_que.push(f)
}

function mappingStatus(i, b, status){
    var nextStatus = status.map(x=>x)
    for (var maplet of CubeMath.mapping[i]){
        var src = b ? maplet[0] : maplet[1]
        var dst = b ? maplet[1] : maplet[0]
        var inc = b ? maplet[2] : (3 - maplet[2]) % 3
        nextStatus[dst] = status[src]
        nextStatus[dst + 8] = (status[src + 8] + inc)%3
    }
    return nextStatus;
}


var blocksCheck =function(){
    console.log("check")
    for (var idx in Blocks){
        var Block = Blocks[idx]
        Block.move_matrix = Block.move_matrix.map(x=>Math.round(x))
        var v = Block.v0
        var m = Block.move_matrix
        var mv = [
            m[0] * v[0] + m[4] * v[1] + m[8] * v[2],
            m[1] * v[0] + m[5] * v[1] + m[9] * v[2],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2],
        ]
       var vi = CubeMath.vertices[idx].toArray()
        //console.log(m.map(x=>Math.round(x)))

        if (!(vi[0] === mv[0] && vi[1] === mv[1] && vi[2] === mv[2])){
            console.error("check fasiled:", idx)
            console.log(Block.idx,v, vv, idx, CubeMath.vertices[idx].toArray())
        }else{
            //console.log(Block.idx,v, vv, idx, CubeMath.vertices[idx].toArray())
            //console.log("check pass")
        }

        //check with getMove
        var inc = cubeStatus[parseInt(idx)+8]
        var src = trans(get3Face(Block.idx, 0))
        var dst = trans(get3Face(idx, inc))
        var m2 = trans(getMove(src, dst))
        
        if (!compareMatrix(m2,subMat3(m))){
            console.error("check fasiled:", idx)
            console.log(Block.idx, m, subMat3(m), m2, cubeStatus)
        }
    }
}

function subMat3(mat4){
    var ret = new Int8Array(9)
    for(var i=0; i<3; i++){
        for(var j=0; j<3; j++){
            ret[i*3+j] = mat4[i*4+j]
        }
    }
    return ret
}

var keyState = {f: false}

window.addEventListener("keydown",function(e){
    keyState.f = true
    keyState.code = e.code
    //console.log(e)
})

function recover(){
    var path = CubeSolver.seekSolve(Coder.getCode(cubeStatus))
    path.map(x=>rotateCubeAnimation(x%6,x<6))
}
function getFaceOffsets(){
    var bytes = new Uint8Array(16)
    for (var idx=0; idx<8; idx++){
        var Block = Blocks[idx]
        bytes[idx] = Block.idx
        var v = Block.f0
        var m = Block.move_matrix
        var mv = [
            m[0] * v[0] + m[4] * v[1] + m[8] * v[2],
            m[1] * v[0] + m[5] * v[1] + m[9] * v[2],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2],
        ]
        for(var k=0; k<3; k++){
            var vi = CubeMath.faces[CubeMath.vertices_f[idx][k]].toArray()
            if(vi[0] === mv[0] && vi[1] === mv[1] && vi[2] === mv[2]){
                bytes[idx+8] = k
            }
        }
    }
    return bytes
}

function getMapping(src, dst){
    var mapping = new Uint8Array(16)
    for (var i=0; i<8; i++){
        for (var j=0; j<8; j++){
            if (src[i] === dst[j]){
                mapping[j] = i
                mapping[j + 8] = (dst[8+j] + 3 - src[8+i]) % 3
                break
            }
        }
    }
    return mapping
}

function get3Face(i, k=0){
    var m = CubeMath.vertices_f[i].map(x=>CubeMath.faces[x].toArray()).reduce((a,b)=>[...a,...b])
    return [...m.slice(k*3,9),...m.slice(0,k*3)]
}
// m * v = u  -coloum vector
function getMove(vs, us){
    return multi(us, inverse(vs))
}

function inverse(m){
    var inv = new Float32Array(9)
    var val = 0
    var a = 1
    for (var i=0; i<3; i++){
        for(var j=0; j<3; j++){
            var i0 = i==0?1:0
            var i1 = i==2?1:2
            var j0 = j==0?1:0
            var j1 = j==2?1:2
            var t = (m[i0*3+j0] * m[i1*3+j1] - m[i1*3+j0] * m[i0*3+j1])
            inv[i+j*3] = a * t            
            a = -a 
        }
        val += inv[i] * m[i*3]
    }
    for(var k=0; k<9; k++){
        inv[k] /= val
    }
    return inv
}

function multi(m1,m2){
    var ret = new Float32Array(9)
    for (var i=0; i<3; i++){
        for(var j=0; j<3; j++){
            for(var k=0; k<3; k++){
                //[ 0 1 
                //  2 3]
                ret[3*i+j] += m1[3*i+k]*m2[3*k+j]

                //[0 2
                // 1 3]
                //ret[i+3*j] += m1[i+3*k]*m2[k+3*j]
            }
        }
    }
    return ret
}

function trans(m){
    var ret = new Float32Array(9)
    for (var i=0; i<3; i++){
        for(var j=0; j<3; j++){
            ret[i*3+j] = m[3*j+i]
        }
    }
    return ret
}

function b2btest(){
    for (var i=0; i<8; i++){
        for (var j=0; j<8; j++){            
            var src = trans(get3Face(i))
            var dst = trans(get3Face(j))
            var m = getMove(src, dst)
            //var n = multi(src, m)
            //console.log(m, src, dst, n)    
            var nn = Blocks[i].vertices.length/3
            for(var ii=0; ii<nn; ii++){
                v = Blocks[i].vertices.slice(ii*3,(ii+1)*3)
                u = Blocks[j].vertices.slice(ii*3,(ii+1)*3)
                var t = [
                    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
                    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
                    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
                ]
                if(!(u[0] === t[0] && u[1] === t[1] && u[2] === t[2])){
                    console.log(i,j,u,t)
                }
            }
        }
    }
}

var eye = [1,0,0, 0,1,0, 0,0,1,]
function inBlockTest(){    
    for(var i=0; i<8; i++){
        for(var k=0; k<3; k++){
            var move0 = getMove(trans(get3Face(i, k)), trans(get3Face(i, (k+0)%3)))
            var move1 = getMove(trans(get3Face(i, k)), trans(get3Face(i, (k+1)%3)))
            var move2 = getMove(trans(get3Face(i, k)), trans(get3Face(i, (k+2)%3)))
            //move0 = eye
            if (!compareMatrix(move0, eye)){
                console.log("!", i, k, move0)
            }
            //move1 * move2 = eye            
            if (!compareMatrix(multi(move1, move2), eye)){
                console.log("!!", i, k, move1, move2)
            }
            //move1 * move1 = move2            
            if (!compareMatrix(multi(move1, move1), move2)){
                console.log("!!!", i, k, move1, move2)
            }
            //move2 * move2 = move1
            if (!compareMatrix(multi(move2, move2), move1)){
                console.log("!!!!", i, k, move1, move2)
            }
        }
        console.log("~", move1, move2)
    }    
}

function compareMatrix(a,b){
    var ret = true
    for(var i=0; i<9; i++){
        if (a[i] !== b[i]){
            ret = false
            break
        }
    }
    return ret
}

function inverseTest(){
    for (var i=0; i<8; i++){
        var m = get3Face(i)
        console.log(multi(m,inverse(m)))
    }
}

function moveTo(code){
    var src = cubeStatus
    var dst = Coder.getBytes(code)
    var dis = getMapping(dst, src)
    var path = CubeSolver.seekSolve(Coder.getCode(dis))
    //path.reverse().map(x=>rotateCubeAnimation(x%6, x>6))
    path.map(x=>rotateCubeAnimation(x%6, x<6))
    //CubeSolver.seekSolve(Coder.getCode(getMapping(Coder.getBytes(code),cubeStatus))).map(x=>rotateCubeAnimation(x%6,x<6))
}
main()
