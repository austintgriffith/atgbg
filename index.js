console.log("setting desktop background to random reddit image...");
var http = require('http');
var request = require('request');
var fs = require("fs");
var osascript = require('node-osascript');
function getImages(callback) {
    return http.get({
        host: 'www.reddit.com',
        path: '/r/EarthPorn.json'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            callback(parsed);
        });
    });
}
var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
try{fs.mkdirSync("images");}catch(err) {}
function refreshBackground(){
    console.log("Loading images...");
    getImages(function(response){
        var randIndex = Math.floor(Math.random()*(response.data.children.length));
        var downAs = Math.floor(Math.random()*99999);
        console.log("Downloading "+response.data.children[randIndex].data.url);
        download(response.data.children[randIndex].data.url,"images/"+downAs, function(){
            var finalImage = __dirname+'/images/'+downAs;
            var size = fs.statSync(finalImage)['size'];
            console.log("size:"+size);
            if(size<100000){
                setTimeout(refreshBackground,1000);
            }else{
                console.log('Setting background '+finalImage+'...');
                osascript.execute('tell application "System Events" to set picture of every desktop to "'+finalImage+'"', function(err, result, raw){
                  if (err) return console.error(err)
                  console.log(result, raw)
                });
            }
        });
    })
}
setInterval(refreshBackground, 3600000);
refreshBackground();
