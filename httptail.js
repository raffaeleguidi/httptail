#!/usr/bin/env node

var program = require('commander');
var HttpTailer = require('./lib/HttpTailer.js').HttpTailer;

program
    .version('0.0.6')
    .arguments('url [otherUrls...]', 'Url to tail')
    .option("-k, --insecure", "Operate even for server connections otherwise considered insecure")
    .option("-n, --number [lines]", "Number of lines (estimated, 100 chars each)", 100)
    .option("-t, --tail", "Follow the tail of the file")
    .option("-p, --pause [msecs]", "Pause in msecs between pollings", 1000)
    .option("-v, --verbose [level]", "low: print #number before the line; high: print url", "no")
    .action(function(url){
        n = parseInt(this.number);
        t = typeof this.tail != "undefined";
        k = typeof this.tail != "undefined";
        v = this.verbose;
        p = this.pause;

        console.log("url: %s", url);
        console.log("lines: %s", n);
        console.log("follow: %s", t);

        for (i in url) {
            if (k) { 
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            }
            var tailer = new HttpTailer(url[i], i, n, p, t, v);
            tailer.start();
        }
    })
    .parse(process.argv);

if (!program.args.length)
    program.outputHelp();

/*

"logagent-js": "*",

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

*/
