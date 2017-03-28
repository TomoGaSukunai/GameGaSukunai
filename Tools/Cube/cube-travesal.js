const __mapping = require("./cube-math").mapping
const coder = require("./cube-coder")
const fs = require("fs")

//check coder
// for(let j=0; j<6561; j++){
//     for (let i=0; i<40320; i++){
//         let c = i + 40320 * j
//         let cc = coder.getCode(coder.getBytes(c))
//         if (c!=cc){
//             console.err("Err:",c,cc)
//         }
//     }
//     console.log("pass",j)
// }


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
let transers = [...lt, ...rt]

// check transers
// let d = 0
// for(let k=0; k<100; k++){
//     let i = Math.floor(Math.random()*40320)
//     let j = Math.floor(Math.random()*6561)
//     let c = i + 40320 * j
//     let b = coder.getBytes(c)
//     for(let ii=0; ii<transers.length; ii++){
//         let tb = transers[ii](b)
//         let ttb = transers[(ii + 6)%12](tb)
//         d = b.reduce((a,b,i)=>a+b-ttb[i] ,0)
//         if (d !==0){
//             console.error("Err:",c,ii)
//             console.log(b)
//             console.log(tb)
//             console.log(ttb)
//             break
//         }
//     }
//     if (d !==0){
//         break
//     }
//     console.log("pass",k)
// }

let ways = transers.map((x,i)=>1<<i)
let seeked = ways.reduce((a,b)=> a|b)


let known = new Uint16Array(264539520)

class myQue{
    constructor(){
        this.pages = []
        this.pageSize = 1024*1024
        this.head = 0
        this.tail = 0
        this.pageHead = 0
        this.headpage = 0
        this.__new_page()
    }
    __new_page(){
        let new_page = new Uint32Array(this.pageSize)
        this.pages.push(new_page)
        this.tailpage = this.pages.length - 1
        this.pageTail = 0
    }
    push(i){
        this.pages[this.tailpage][this.pageTail++] = i
        this.tail++
        
        if (this.pageTail >= this.pageSize){
            this.__new_page()
        }
    }
    isEmpty(){
        return this.head >= this.tail
    }
    pop(){
        if (this.pageHead >= this.pageSize){
            this.headpage++
            this.pageHead = 0
        }
        this.head++
        return this.pages[this.headpage][this.pageHead++]
    }
    size(){
        return this.tail - this.head
    }
}

let logk = 0
let level = 0
let levels = new Uint8Array(20)
let coded = 0
let begin = Date.now()
let last = begin

let ques = []
let que_now 
let que_next = new myQue()
que_next.push(0)


fs.writeFileSync(__dirname + "/que.data", new Uint8Array(0), "binary")

while (!que_next.isEmpty()){
    level++
    que_now = que_next
    que_next = new myQue()

    ques.push(que_now)

    let buff = new Buffer(que_now.tail*4)
    let idx = 0
    for (let page of que_now.pages){
        for (let i=0; i<que_now.pageSize && idx<que_now.tail; i++){
            buff.writeInt32BE(page[i],idx++)
        }
    }
    fs.appendFileSync(__dirname + "/que.data", buff, "binary")

    while(!que_now.isEmpty()){
        let nkcs = que_now.pop()
        if (known[nkcs] != seeked){
            let kcs = coder.getBytes(nkcs)
            for(let i=0; i<transers.length; i++){
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
        if (coded > logk){
            logk += 10000000
            let now = Date.now()
            console.log("T:" + (now-last) + "ms", "Coded:" + coded, que_now.head*100/que_now.tail + "%")
            console.log("L:" + level,"Q:" + que_now.size(), "N:" + que_next.size())
        }        
    }
    let now = Date.now()
    console.log("T:" + (now-last) + "ms", "Coded:" + coded, que_now.head*100/que_now.tail + "%")
    console.log("L:" + level,"Q:" + que_now.size(), "N:" + que_next.size())
    
    if (level == 18){
        break
    }
}
let end = Date.now()
console.log((end-begin)+"ms")



//save levels
fs.writeFileSync(__dirname + "/levels.data", Buffer.from(new Uint32Array(levels)), "binary")
//svae ques 
// fs.writeFileSync(__dirname + "/que.data", new Uint8Array(0), "binary")
// for (let que of ques){
//     let buff = new Buffer(que.tail)
//     let idx = 0
//     for (let page of que.pages){
//         for (let i=0; i<que.pageSize && idx<que.tail; i++){
//             buff.writeInt32BE(page[i],idx++)
//         }
//     }
//     fs.appendFileSync(__dirname + "/que.data", buff, "binary")
// }


module.exports