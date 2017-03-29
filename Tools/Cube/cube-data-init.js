var fs = require("fs")
var coder = require("./cube-coder")
var transers = require("./cube-travesal").transers

var Timer = {
    timeStamp: 0,
    set(){
        this.timeStamp = Date.now()
    },
    tic(){
        var now = Date.now()
        console.log(now - this.timeStamp)
    },
    tac(){
        var now = Date.now()
        console.log(now - this.timeStamp)
        this.timeStamp = now
    }
}

var readFileInts = function (filename, callbcak){
    var bufferLength = fs.lstatSync(filename).size
    fs.open(filename,"r", function(err,fd){
        if (err){
            console.log(err)
            return
        }
        var buf = new Buffer(bufferLength)        
        //console.log(fd)
        fs.read(fd, buf, 0, bufferLength, null ,function(err, bytesRead, buffer){
            callbcak(buffer)          
        })
    })
}

function getR2(code){
    return Math.floor(code / 40320)
}

function getZCode(code){
    return (code % 40320) + Math.floor(code / 40320 / 3) * 40320
}

var data = {
    check(code){
        var r2 = getR2(code)
        return r2 === this.r2s[Math.floor(r2 / 3)]
    },
    seekSolve(code){
        
        if (!this.check(code)){
            console.log("illegal code r2")
            return void 0
        }
        var path = []
        var bytes = coder.getBytes(code)
        var dist = this.distribution[getZCode(code)]
        for (; dist>0;){        
            for (var i=0; i<transers.length; i++){
                var next_bytes = transers[i](bytes)
                var c = coder.getCode(next_bytes)
                var next_dist  = this.distribution[getZCode(c)]
                if (next_dist < dist){
                    path.push(i)
                    bytes = next_bytes
                    dist = next_dist
                    break
                }
            }
        }
        return path
    }
}

function test(){
    readFileInts(__dirname+"/levels.data",function(buffer){
        var levels = data.levels = new Uint32Array(buffer.length/4)        
        for(var idx=0, offset=0; offset<buffer.length; idx++,offset+=4){
            levels[idx] = buffer.readInt32BE(offset)
        }
        //console.log(levels)
        var then = Date.now()
        readFileInts(__dirname+"/que.data",function(buffer){
            var ques = data.ques = new Uint32Array(buffer.length/4)
            for(var idx=0, offset=0; offset<buffer.length; idx++,offset+=4){
                ques[idx] = buffer.readInt32BE(offset)
            }
            console.log(Date.now() - then)
            
            // data.r2s = new Uint16Array(2187)

            // for(var code of ques){
            //     var r2 = getR2(code)
            //     var r2z = Math.floor(r2 / 3)
            //     if (!data.r2s[r2z])
            //         data.r2s[r2z] = r2
            // }
            // fs.writeFileSync(__dirname + "/r2s.data", Buffer.from(data.r2s.buffer), "binary")

            then = Date.now()
            data.distribution = leveledQueToDistribution(levels, ques)
            console.log(Date.now() - then)
            then = Date.now()
            
            // data.transed = transeDistribution(data.distribution)
            // console.log(Date.now() - then)
            // then = Date.now()
            // data.zip = zipDistribution(data.transed)
            // console.log(Date.now() - then)        
            // fs.writeFileSync(__dirname+"/ziped.data",data.zip,"binary")
            // then = Date.now()            
            // data.unzip = unzipDistribution(data.zip)
            // console.log(Date.now() - then)
            // then = Date.now()

            // //check
            // compareArrays(data.unzip, data.transed)

            readFileInts(__dirname + "/ziped.data",function(buffer){
                var ziped = data.ziped = new Uint8Array(buffer)
                console.log(Date.now() - then)
                then = Date.now()

                data.unzip = unzipuntranseDistribution(ziped)
                console.log(Date.now() - then)
                then = Date.now()
                

                // data.unzip = unzipDistribution(ziped)
                // console.log(Date.now() - then)
                // then = Date.now()
                // //check
                // //compareArrays(data.unzip, data.transed)
                
                // data.unzip = untranseDistribution(data.unzip)
                // console.log(Date.now() - then)
                // then = Date.now()
                
                travesalFullfill(data.unzip, 6)
                console.log(Date.now() - then)
                then = Date.now()

                // checkDistribute(data.unzip)
                // checkDistribute(data.distribution)
                //data.diff = getDiff(data.distribution, data.unzip)

                readFileInts(__dirname+"/r2s.data",function(buffer){
                    var r2s = data.r2s = new Uint16Array(buffer.buffer)
                    // for(var idx=0, offset=0; offset<buffer.length; idx++,offset+=2){
                    //     r2ss[idx] = buffer.readInt16BE(offset)
                    // }
                })
            })
        })
    })
}

data.initDistributionFromQue = function(){
    Timer.set()
    var buff = fs.readFileSync(__dirname + "/levels.data")
    var levels /*= data.levels*/ = new Uint32Array(buff.buffer.slice(buff.offset, buff.offset + buff.length))
    buff = fs.readFileSync(__dirname + "/que.data")
    var ques /*= data.ques*/ = new Uint32Array(buff.buffer.slice(buff.offset, buff.offset + buff.length))    
    var distribution /*= data.distribution*/ = leveledQueToDistribution(levels, ques)    
    
    var r2s = r2sFromQue(ques)

    data.r2s = r2s
    data.distribution = distribution
    Timer.tac()
}

data.initDistributionFromZipR2s = function(){
    Timer.set()
    var buff = fs.readFileSync(__dirname + "/zipped.data")
    var ziped /*= data.ziped*/ = new Uint8Array(buff)
    var distribution /*= data.distribution*/ = unzipuntranseDistribution(ziped)    
    travesalFullfill(distribution, 6)
    buff = fs.readFileSync(__dirname + "/r2s.data")
    var r2s /*= data.r2s*/ = new Uint16Array(buff.buffer.slice(buff.offset, buff.offset + buff.length))
    
    data.r2s = r2s
    data.distribution = distribution
    Timer.tac()
}

data.zippingAndR2s = function(){
    data.initDistributionFromQue()
    Timer.set()
    //save r2s
    fs.writeFileSync(__dirname + "/r2s.data", Buffer.from(data.r2s.buffer), "binary")    
    //save zip
    var transed /*= data.transed*/ = transeDistribution(data.distribution)
    var zipped /*= data.ziped*/ = zipDistribution(transed)            
    fs.writeFileSync(__dirname + "/zipped.data", zipped, "binary")
    Timer.tac()
    // //check 
    // var unzipped /*= data.unzip*/ = unzipDistribution(zipped)
    // compareArrays(unzipped, transed)
}

data.test = function(){
    data.initDistributionFromQue()
    var dist1 = data.distribution
    var r2s1 = data.r2s

    data.initDistributionFromZipR2s()
    var dist2 = data.distribution
    var r2s2 = data.r2s

    console.log(dist1 == dist2)
    //chcek
    Timer.set()    
    compareArrays(dist1, dist2)
    Timer.tac()
    compareArrays(r2s1, r2s2)
    Timer.tac()
}

function r2sFromQue(ques){
    var r2s = new Uint16Array(2187)
    for(var code of ques){
        var r2 = getR2(code)
        var r2z = Math.floor(r2 / 3)
        if (!r2s[r2z]){
            r2s[r2z] = r2
        }
    }
    return r2s    
}

function travesalFullfill(array, levelDepth){

    let begin = last = Date.now()
    let coded = 0
    let known = {}    
    let ways = transers.map((x,i)=>1<<i)
    let seeked = ways.reduce((a,b)=> a|b)
    let level = 0
    let que_now 
    let que_next = []
    que_next.push(0)
    array[0] = 0
    while (que_next.length){
        level++        
        que_now = que_next
        que_next = []

        while(que_now.length){
            let nkcs = que_now.pop()
            if (known[nkcs] != seeked){
                if (known[nkcs] === undefined){
                    known[nkcs] = 0
                }
                let kcs = coder.getBytes(nkcs)
                for(let i=0; i<transers.length; i++){
                    if ((known[nkcs] & ways[i]) == 0){
                        let ncs = transers[i](kcs)
                        let nncs = coder.getCode(ncs)
                        coded++
                        if (known[nncs] === undefined){
                            known[nncs] = 0
                            que_next.push(nncs)
                            var r1 = nncs % 40320
                            var r2 = Math.floor(nncs / 40320 / 3)
                            var idx = r1 + r2*40320
                            array[idx] = level
                        }
                        known[nkcs] += ways[i]
                        known[nncs] += ways[(i + 6)%12]
                    }
                }
            }
        }
        let now = Date.now()
        console.log("T:" + (now-last) + "ms", "Coded:" + coded)
        console.log("L:" + level,"Q:" + que_now.length, "N:" + que_next.length)        
        if (level == levelDepth){
            break
        }
    }
    // let end = Date.now()
    // console.log((end-begin)+"ms")
}

function getDiff(a,b){
    var diff = []
    var n = a.length
    var flag = true
    for (var i=0; i<n; i++){
        if (a[i] !== b[i]){
            diff.push({
                i: i,
                a: a[i], 
                b: b[i],
            })
        }
    }
    return diff
}

function compareArrays(a, b){
    var n = a.length
    var flag = true
    for (var i=0; i<n; i++){
        if (a[i] !== b[i]){
            flag = false
            console.log(i)
            break
        }
    }
    console.log(flag)
}

function checkDistribute(distribution){
    var lvl = []
    for (var l of distribution){
        if (lvl[l]){
            lvl[l]++
        }else {
            lvl[l] = 1
        }
    }
    console.log(lvl)
}

function leveledQueToDistribution(levels, ques){
    //var level = 0
    var distribution = new Uint8Array(levels.reduce((a,b)=>a+b))
    for (var level=0, i=0; level<levels.length; level++){        
        for(j=0; j<levels[level]; j++){
            var idx = getZCode(ques[i++])
            distribution[idx] = level
        }
    }
    return distribution
}

function transeDistribution(distribution){
    var nn = distribution.length
    var trans = new Uint8Array(distribution)
    for(var i=0; i<nn; i++){        
        trans[i] = trans[i]<7?7:14-trans[i]        
    }
    //check
    //checkDistribute(trans)
    return trans
}

function untranseDistribution(transed){
    var nn = transed.length
    var distribution = new Uint8Array(transed)
    for(var i=0; i<nn; i++){        
        distribution[i] = 14 - distribution[i]        
    }
    //check
    //checkDistribute(trans)
    return distribution
}

function zipDistribution(transed){    
    var nn = transed.length/8
    var nn2 = nn + nn
    var ziped = new Uint8Array(nn*3)
    var bits = new Uint8Array([0,1,2,3,4,5,6,7].map(x=>1<<x))
    var idx = 0
    for (var i=0; i <nn; i++){
        for (var j=0; j<8; j++){
            ziped[i] += (transed[idx] & 1)?bits[j]:0
            ziped[i + nn] += (transed[idx] & 2)?bits[j]:0
            ziped[i + nn2] += (transed[idx] & 4)?bits[j]:0
            idx++
        }
    }
    return ziped
}

function unzipDistribution(ziped){
    var nn = ziped.length/3
    var nn2 = nn + nn
    var unzip = new Uint8Array(nn * 8)
    var bits = new Uint8Array([0,1,2,3,4,5,6,7].map(x=>1<<x))    
    var idx = 0
    for (var i=0; i<nn; i++){
        for(var j=0; j<8; j++){
            unzip[idx] += (ziped[i] & bits[j]) ? 1:0 
            unzip[idx] += (ziped[i + nn] & bits[j]) ? 2:0
            unzip[idx] += (ziped[i + nn2] & bits[j]) ? 4:0
            idx++
        }
    }
    return unzip
}

function unzipuntranseDistribution(ziped){
    var nn = ziped.length/3
    var nn2 = nn + nn
    var unzip = new Uint8Array(nn * 8)
    var bits = new Uint8Array([0,1,2,3,4,5,6,7].map(x=>1<<x))    
    var idx = 0
    for (var i=0; i<nn; i++){
        for(var j=0; j<8; j++){
            unzip[idx] = 14
            unzip[idx] -= (ziped[i] & bits[j]) ? 1:0 
            unzip[idx] -= (ziped[i + nn] & bits[j]) ? 2:0
            unzip[idx] -= (ziped[i + nn2] & bits[j]) ? 4:0            
            idx++
        }
    }
    return unzip
}

data.init = function(){
    try {
        data.initDistributionFromZipR2s()
    } catch (error) {
        try {
            data.zippingAndR2s()
        } catch (error) {
            var travesal = require("./cube-travesal")            
            travesal.saveQues(travesal.travesal())
            data.initDistributionFromZipR2s()
        }  
    }
    
}


module.exports = data