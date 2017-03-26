class V3{
    constructor(x,y,z){
        this.x = x
        this.y = y
        this.z = z
    }
    inner(v){
        return this.x * v.x + this.y * v.y + this.z * v.z
    }
    outer(v){
        var x = this.y * axis.z - axis.y * this.z
        var y = this.z * axis.x - axis.z * this.x
        var z = this.x * axis.y - axis.x * this.y
        return new V3(x, y, z)
    }
    rotate90(axis){
        var along = this.inner(axis)
        var x = this.y * axis.z - axis.y * this.z + along * axis.x
        var y = this.z * axis.x - axis.z * this.x + along * axis.y
        var z = this.x * axis.y - axis.x * this.y + along * axis.z
        return new V3(x, y, z)        
    }
    equals(v){
        return this.x === v.x && this.y === v.y && this.z === v.z
    }
    toArray(){
        return [this.x, this.y, this.z]
    }
}

const bs = [-1,1]
const vertices = []
for(var x of bs){
    for(var y of bs){
        for(var z of bs){
            vertices.push(new V3(x,y,z))
        }
    }
}

const faces = []
for(var b of bs){
    faces.push(new V3(b,0,0), new V3(0,b,0),new V3(0,0,b))
}

const faces_v =  faces.map(x=>[])
const vertices_f = vertices.map(x=>[])
for (var i in vertices){
    var vertex = vertices[i]
    for(var j in faces){
        var face = faces[j]
        if(vertex.inner(face) == 1){
            faces_v[j].push(i)
            vertices_f[i].push(j)
        }
    }
    var fs = vertices_f[i].map(i=>faces[i])
    if (! fs[2].rotate90(fs[1]).equals(fs[0])){
        vertices_f[i].reverse()
    }    
}

var trans_F = faces.map(x=>[])
for (var i in faces){    
    for(var j in faces_v){
        var rotated = faces[j].rotate90(faces[i])
        for (var k in faces){
            if (rotated.equals(faces[k])){
                trans_F[i][j] = k
                break
            }
        }
    }
}

const mapping = faces.map(x=>faces.map(x=>[]))

for(var i in faces_v){
    var face_v = faces_v[i]
    for(var j in face_v){
        var src = face_v[j]
        var rotated = vertices[src].rotate90(faces[i])
        var dst = 0
        for (dst in vertices){
            if(rotated.equals(vertices[dst])){                
                break
            }
        }

        for(var k = 0; k <3; k++){
            if (trans_F[i][vertices_f[src][0]] == vertices_f[dst][k]){
                var maplet = [src, dst, k]
                mapping[i][j] = maplet
                //console.log("Rot along " + i+ " block: " +src + "->"+dst + "||" + k)
            }
        }
    }
}

module.exports = {
    vertices,
    faces,
    faces_v,
    vertices_f,
    mapping,
}