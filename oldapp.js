var request = require('request');
var fs = require('fs');
var byline = require('byline');

// https://github.com/sematext/logagent-js/blob/master/patterns.yml

/*
var Logparser = require('logagent-js')
var lp = new Logparser('./patterns.yml')
lp.parseLine('log message', 'source name', function (err, data) {
    if(err) {
      console.log('line did not match with any pattern')
    }
    console.log(JSON.stringify(data))
})
*/

var n = 0;

var options = {
    url: 'http://logs.fe.nord.coll:8003/access_log.csv',
    //url: 'http://logs.fe.nord.coll:8003/error_log',
    proxy: false
};

function go(start) {
//        console.log("start= %s", start);
        var thisChunkSize;
        var stop = false;
        options.headers = {
            "Range": "bytes=" + (start) + "-"
        }
        request
            .get(options)
            .on('response', function(response) {
                if (response.statusCode != 206) {
                //if (response.statusCode == 416) {
                    stop = true;
                    this.emit("end");


                    setTimeout(function(){
                        go(start);
                    }, 2000)

                    return;
                }
                thisChunkSize = parseInt(response.headers['content-length']);
/*
                console.log("chunk size= %s", response.headers['content-length'])
                console.log(response.statusCode) // 200
                console.log(response.headers['content-length']) // 'image/png'
                console.log(response.headers) // 'image/png'
*/
            })
            .pipe(byline.createStream())
            .on('data', function(chunk){
                //console.log("line %d: %s", n++, chunk);
                console.log(chunk.toString());
            })
            .on('end', function(chunk){
                thisChunkSize;
                if (!stop) {
                    setTimeout(function(){
                        go(start + thisChunkSize);
                    }, 2000)
                    //go(start + thisChunkSize);
                }
            })
}

request.head(options, function(err, httpResponse, body){
    var start = parseInt(httpResponse.headers["content-length"]) - 1000;
    go(start);
})
