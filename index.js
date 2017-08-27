console.log("setting desktop background to random reddit image...");
var https = require('https');
var request = require('request');
var fs = require("fs");
var mime = require('mime');
var osascript = require('node-osascript');




function getImages(callback) {
    var path = getPath();
    console.log("Hitting reddit "+path+" ...");
    return https.get({
        host: 'www.reddit.com',
        path: path
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            //console.log(body);
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
    if( res.headers['content-type']!="image/jpeg" && res.headers['content-type']!="image/png" ){
      console.log("WRONG TYPE, TRY AGAIN")
      setTimeout(refreshBackground,1000);
    }else{
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    }

  });
};
var FILESIZELIMIT = 200000;
try{fs.mkdirSync("images");}catch(err) {}
function refreshBackground(){
    console.log("Loading images...");
    getImages(function(response){
        //console.log(response);
        var randIndex = Math.floor(Math.random()*(response.data.children.length));
        var downAs = Math.floor(Math.random()*99999);
        console.log("Downloading "+response.data.children[randIndex].data.url);
        let over18 = response.data.children[randIndex].data.over_18;
        console.log("over18:",over18)
        if(over18){
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!OVER 18! SKIP")
        }else{
          download(response.data.children[randIndex].data.url,"images/"+downAs, function(){
              var finalImage = __dirname+'/images/'+downAs;
              var size = fs.statSync(finalImage)['size'];
              console.log("size:"+size);
            //  var type = mime.lookup(__dirname+'/images/'+downAs);
            //  console.log("type:"+type);
              //|| type=="application/octet-stream"
              if(size<FILESIZELIMIT ){
                  setTimeout(refreshBackground,1000);
              }else{
                  console.log('Setting background '+finalImage+'...');
                  osascript.execute('tell application "System Events" to set picture of every desktop to "'+finalImage+'"', function(err, result, raw){
                    if (err) return console.error(err)
                    console.log(result, raw)
                  });
              }
          });
        }

    })
}

//https://www.reddit.com/r/ImaginaryLandscapes/

function getPath(){
  if(Math.random()>0.3){
    return '/r/itookapicture.json'
//  }else if(Math.random()>0.3){
  //  return '/r/MostBeautiful.json'
  }else{
    return '/r/EarthPorn.json'
  }
}
setInterval(refreshBackground, 120000);
refreshBackground();
