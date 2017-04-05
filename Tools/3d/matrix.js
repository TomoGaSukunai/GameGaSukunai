class MAT4{
    constructor(array){
        if (array !== undefined){
            this.array = new Float32Array(array)
        }else{
            this.array = new Float32Array(16)
            for(let i=0; i<4; i++){
                this.array[i*4+i] = 1.0
            }
        }
        for (let i=0; i<16; i++){
            Object.defineProperty(this, i, {
                get:function(){
                    return this.array[i]
                }, 
                set:function(x){
                    this.array[i] = x
                }
            })
        }
    }
}

const $MAT4 = {
    create(){
        return new MAT4()
    },
    createProjection(angle = 40, a = 1, zMin = 1, zMax = 100){
        let ang = Math.tan((angle * 0.5)*Math.PI/180)
        return new MAT4([
            0.5/ang,0,0,0,
            0,0.5*a/ang,0,0,
            0,0,-(zMax+zMin)/(zMax-zMin),-1,
            0,0,-2*(zMax*zMin)/(zMax-zMin),0,
        ])
    },
    createView(){
        let ret = new MAT4()
        ret[14] = 6
        return ret
    },
    rotate(mat, xi, angle = Math.PI/2){
        let c = Math.cos(angle)
        let s = Math.sin(angle)        
        for (let i=0; i<3; i++){
            let j0 = (xi+1)%3 + 4*i
            let j1 = (xi+2)%3 + 4*i
            let t = mat[j0]
            mat[j0] = c * mat[j0] - s * mat[j1]
            mat[j1] = c * mat[j1] + s * t
        }
    }
}




module.exports = {
    MAT4,
    $MAT4,
}