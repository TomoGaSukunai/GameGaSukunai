var Coder = {
    getBytes(code){
        var code = parseInt(code)
        if (!isFinite(code)){
            throw new Error("illegal code")
        }
        var r1 = code % 40320
        var r2 = Math.floor(code / 40320)
        var t = 40320
        var ret = new Uint8Array(16)
        var used = ret.slice(0,8).map(x=>false)
        for(var i=0; i<8; i++){
            t /= (8-i)
            ret[i] = Math.floor(r1/t)
            ret[15-i] = r2 % 3
            r1 %= t
            r2 /= 3
        }
        for(var i=0; i<8; i++){
            for (var j=0; j<=ret[i]; j++){
                if(used[j]){
                    ret[i]++
                }
            }
            used[ret[i]] = true
        }
        return ret
    },
    getCode(bytes){
        var r1 = 0
        var r2 = 0        
        for(var i=0; i<8; i++){
            var t = bytes[i]
            for(var j=0; j<i; j++){
                if(bytes[i] > bytes[j]){
                    t--
                }
            }
            r2 = (r2 *3 + bytes[8+i])
            r1 = (r1*(8-i) + t)
        }
        return (r1 + 40320 *r2)
    }
}

module.exports = Coder