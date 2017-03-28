var fs = require("fs")

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

var data = {}

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
        then = Date.now()
        data.distribution = leveledQueToDistribution(levels, ques)
        console.log(Date.now() - then)
        then = Date.now()
        
        data.transed = transeDistribution(data.distribution)
        console.log(Date.now() - then)
        then = Date.now()
        data.zip = zipDistribution(data.transed)
        console.log(Date.now() - then)
        
        then = Date.now()            
        data.unzip = unzipDistribution(data.zip)
        console.log(Date.now() - then)
        then = Date.now()

        // //check
        // compareArrays(data.unzip, data.transed)

        // readFileInts(__dirname + "/ziped.data",function(buffer){
        //     var ziped = data.ziped = new Uint8Array(buffer)
        //     data.unzip = unzipDistribution(ziped)
        //     console.log(Date.now() - then)
        //     then = Date.now()
        //     //check
        //     compareArrays(data.unzip, data.transed)
            
        //     data.unzip = untranseDistribution(data.unzip)
        //     travesalFullfill(data.unzip, 5)
        //     checkDistribute(data.unzip)
        //     checkDistribute(data.distribution)
        //     data.diff = getDiff(data.distribution, data.unzip)
        // })
    })
})

function travesalFullfill(array, levelDepth){
    const __mapping = require("./cube-math").mapping
    const coder = require("./cube-coder")
    let getTranser = function (maplet){
        let _maplet = maplet
        return function(bytes){
            let ret = new Uint8Array(bytes)
            for (let m of _maplet){
                ret[m.dst] = bytes[m.src]
                ret[m.dst + 8] = (bytes[m.src + 8] + m.inc) % 3
            }
            return ret
        }
    }
    let lt = []
    let rt = []
    for (let maplet of __mapping){
        let clw = maplet.map(x=>{return {src: x[0], dst: x[1], inc: x[2]}})
        let acw = maplet.map(x=>{return {src: x[1], dst: x[0], inc: (3-x[2])%3}})

        lt.push(getTranser(clw))
        rt.push(getTranser(acw))    
    }
    let begin = last = Date.now()
    let logk = 0
    let coded = 0
    let known = {}
    let transers = [...lt, ...rt]
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
                        if (level<levelDepth && known[nncs] === undefined){
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
            if (coded > logk){
                logk += 10000000
                let now = Date.now()
                console.log("T:" + (now-last) + "ms", "Coded:" + coded)
                console.log("L:" + level,"Q:" + que_now.length, "N:" + que_next.length)
            }        
        }
        let now = Date.now()
        console.log("T:" + (now-last) + "ms", "Coded:" + coded)
        console.log("L:" + level,"Q:" + que_now.length, "N:" + que_next.length)
        
        if (level == levelDepth){
            break
        }
    }
    let end = Date.now()
    console.log((end-begin)+"ms")
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
    var distribution = new Uint8Array(levels.reduce((a,b)=>Math.max(a,b)))
    for (var level=0, i=0; level<levels.length; level++){
        for(;i<levels[level];i++){
            var r1 = data.ques[i] % 40320
            var r2 = Math.floor(data.ques[i] / 40320 / 3)
            var idx = r1 + r2*40320
            //var idx = ques[i]
            distribution[idx] = level
        }
    }
    //distribution = distribution.map(x=>(14-x)>7?7:(14-x))
    //check
    //checkDistribute(distribution)

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



module.exports = data