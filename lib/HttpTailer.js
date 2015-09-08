var request = require('request');
var byline = require('byline');


exports.HttpTailer = HttpTailer;

function HttpTailer(url, index, n, p, t, v) {
    this.options = {
        url: url,
        proxy: false
    },
    this.url = url;
    this.index = index;
    this.n = n;
    this.p = p;
    this.t = t;
    this.verbose = v;

    var ctx = this;

    this.start = function(cb){
        request.head(this.options, function(err, httpResponse, body){
            var startFrom = parseInt(httpResponse.headers["content-length"]) - parseInt(ctx.n * 100);
            if (cb)
                ctx.tail(startFrom, cb);
            else
                ctx.tail(startFrom);
        });
    };

    this.tail = function(startFrom, cb){
        var thisChunkSize;
        var stop = false;

        var options = {
            url: ctx.options.url,
            headers : {
                "Range": "bytes=" + (startFrom) + "-",
            },
            proxy: ctx.options.proxy
        };

        request
            .get(options)
            .on('response', function(response) {
                if (response.statusCode != 206) {//if (response.statusCode == 416) {
                    stop = true;
                    this.emit("end");

                    setTimeout(function(){
                        ctx.tail(startFrom, cb);
                    }, ctx.p)

                    return;
                } else {
                    stop = false;
                }
                thisChunkSize = parseInt(response.headers['content-length']);
            })
            .pipe(byline.createStream())
            .on('data', function(chunk){
                if (!stop) {
                    //console.log(typeof cb);
                    if (cb) {
                        cb(ctx.index, ctx.url, chunk);
                    } else {
                        if (ctx.verbose) {
                            console.log("[%s]   %s", ctx.url, chunk.toString());
                        } else {
                            console.log("[#%d] %s", ctx.index, chunk.toString());
                        }
                    }
                }
            })
            .on('end', function(chunk){
                if (!stop && t) {
                    setTimeout(function(){
                        ctx.tail(startFrom + thisChunkSize, cb);
                    }, p)
                }
            });
    }
}
