# httptail

httptail is a simple tool that lets tail a file, or multiple files at the same moment, over http. Just expose your logs on an apache (or whatever) VirtualDirectory and enjoy an "heroku logs"-like experience. The tool can also be used as a nodejs library; instead of logging to the console it will give you a callback(index, url, chunk) for every "tailed" file.

        var lines = 100;
        var pause = 1000;
        var tail = true;
        
        for (i in url) {
            var tailer = new HttpTailer(url[i], i, lines, p, t);
            tailer.start(function(index, url, chunk){
                console.log(chunk.toString());
            });
        }


npm install httptail -g

Usage: httptail url [otherUrls...] [options]

  Options:
  
       -h, --help            output usage information
       -V, --version         output the version number
       -n, --number [lines]  Number of lines (estimated, 100 chars each)
       -t, --tail            Follow the tail of the file
       -p, --pause [msecs]   Pause in msecs between pollings
       -v, --verbose         Use #number instead of url in output
   
To build and install from source locally:

* git clone https://github.com/raffaeleguidi/httptail
* cd httptail
* npm -g install .
  
