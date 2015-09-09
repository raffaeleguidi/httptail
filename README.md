# httptail

httptail is a simple tool that lets tail a file, or multiple files at the same moment, over http. Just expose your logs on an apache (or whatever) VirtualDirectory and enjoy an "heroku logs"-like experience. The tool can also be used as a nodejs library; instead of logging to the console it will give you a callback(index, url, chunk) for every "tailed" file like in the following example, in which it pairs with the wonderful logstash-client:

        var Logstash = require('logstash-client');
        var HttpTailer = require('httptail/lib/HttpTailer').HttpTailer;

        var logstash = new Logstash({
          type: 'udp', // udp, tcp, memory 
          host: 'localhost',
          port: 9999 //13333
        });

        var lines = 100;
        var pause = 1000;
        var tail = true;
        var url = [
            "http://logs.machine.a:8003/apache/access_log",
            "http://logs.machine.b:8003/apache/access_log",
            "http://logs.machine.c:8003/apache/access_log",
            "http://logs.machine.d:8003/apache/access_log"
        ];

        var count = 0;

        for (i in url) {
            var tailer = new HttpTailer(url[i], i, lines, pause, tail);
            tailer.start(function(index, url, chunk){
                logstash.send("[" + url + "] " + chunk.toString(), function(){
                    console.log("%d lines sent", (++count));
                });
            });
        }


## Installation

        npm install httptail -g

## Usage

        httptail url [otherUrls...] [options]

        Options:
  
       -h, --help             output usage information
       -V, --version          output the version number
       -n, --number [lines]   Number of lines (estimated, 100 chars each)
       -t, --tail             Follow the tail of the file
       -p, --pause [msecs]    Pause in msecs between pollings
       -v, --verbose [level]  low: print #number before the line; high: print url
   
## Development

To build and install from source locally:

* git clone https://github.com/raffaeleguidi/httptail
* cd httptail
* npm -g install .
  
