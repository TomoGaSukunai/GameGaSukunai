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
    let clw = maplet.map(x=>{return {src: x[0], dst: x[1],inc: x[2]}})
    let acw = maplet.map(x=>{return {src: x[1], dst: x[2],inc: (3-x[2])%3}})

    lt.push(getTranser(clw))
    rt.push(getTranser(acw))    
}
let transers = [...lt, ...rt]
let ways = transers.map((x,i)=>1<<i)
let seeked = ways.reduce((a,b)=> a|b)

let level = 0
let levels = new Uint8Array(20)

let coded = 0
let logk = 0
let begin = Date.now()
let last = begin

let known = new Uint16Array(264539520)

let que_now
let que_next = []
que_next.push(0)

while (que_next.length){
    levels[level++] = que_next.length
    que_now = que_next
    que_next = []
    while(que_now.length){
        let nkcs = que_now.pop()
        if (known[nkcs] != seeked){
            let kcs = coder.getBytes(nkcs)
            for(let i in transers){
                if ((known[nkcs] & ways[i]) == 0){
                    let ncs = transers[i](kcs)
                    let nncs = coder.getCode(ncs)
                    coded++
                    if (known[nncs] == 0){
                        que_next.push(nncs)
                    }
                    known[nkcs] += ways[i]
                    known[nncs] += ways[(i + 6)%12]
                }
            }
        }
        if (coded < logk){
            logk += 1000
            let now = Date.now()
            console.log("T:" + (now-last) + "ms", "Coded:" + coded, que_now.length*100/que_next.length)
            console.log("L:" + level,"Q:" + que_now.length, "N:" + que_next.length)
        }        
    }
    let now = Date.now()
    console.log("T:" + (now-last) + "ms", "Coded:" + coded, que_now.length*100/que_next.length)
    console.log("L:" + level,"Q:" + que_now.length, "N:" + que_next.length)
    if (level == 2){
        break
    }
}
let end = Date.now()
console.log((end-begin)+"ms")