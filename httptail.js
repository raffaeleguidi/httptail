#!/usr/bin/env node

var request = require('request');
var fs = require('fs');
var byline = require('byline');
var program = require('commander');
var n = 0;
var t = true;
var p = 1000;

var options = {
    //url: 'http://logs.fe.nord.coll:8003/access_log.csv',
    //url: 'http://logs.fe.nord.coll:8003/error_log',
    proxy: false
};

program
    .arguments('url', 'Url to tail')
    .usage('url [options]')
    .version('0.0.1')
    .option("-n, --number [lines]", "Number of lines (estimated, 100 chars each)", 100)
    .option("-t, --tail [follow]", "Follow the tail of the file")
    .option("-p, --pause [msecs]", "Pause in msecs between pollings", 1000)
    .action(function(url, opts){
        n = opts.number;
        t = opts.tail;
        p = opts.pause;

        console.log("url: %s", url);
        console.log("lines: %s", opts.number);
        console.log("follow: %s", opts.tail);

        console.log("starting httptail on %s", url)
        options.url = url;
        request.head(options, function(err, httpResponse, body){
            var start = parseInt(httpResponse.headers["content-length"]) - (opts.number * 100);
            go(start);
        });
    })
    .parse(process.argv);

if (!program.args.length)
    program.outputHelp();

    
function go(start) {
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
        })
        .pipe(byline.createStream())
        .on('data', function(chunk){
            //console.log("line %d: %s", n++, chunk);
            console.log(chunk.toString());
        })
        .on('end', function(chunk){
            if (!stop && t) {
                setTimeout(function(){
                    go(start + thisChunkSize);
                }, p)
            }
        })
}

function parserExample() {
    // https://github.com/sematext/logagent-js/blob/master/patterns.yml
    var Logparser = require('logagent-js')
    var lp = new Logparser('./patterns.yml')
    lp.parseLine('log message', 'source name', function (err, data) {
        if(err) {
          console.log('line did not match with any pattern')
        }
        console.log(JSON.stringify(data))
    })
}

