var express = require('express');
var path = require('path');


var port = process.argv[2] || 3000;
var app = express()

var server = app.listen(port, function(){
});

var fetchTracingData = function(res){
  var record = require('../trace.json');
    var fs = require("fs")
    const path = require('path');

    const directory = 'dist/snapshots';

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    });

    var start = record["traceEvents"][0];
    var snapshots = record["traceEvents"].filter((item) => {
      return item.cat === "disabled-by-default-devtools.screenshot";
    })

    var imagesURL = [];

    for(let i = 0 ; i < snapshots.length; i++){
      imagesURL.push("../snapshots/"+ (snapshots[i]["ts"] - start["ts"]) +".png");
      fs.writeFile("./"+ directory +"/"+ (snapshots[i]["ts"] - start["ts"]) +".png", snapshots[i]["args"]["snapshot"], 'base64',
      function(err) {

      });
    }
    console.log('fetch done!');
    res.json({urls: imagesURL});
}

app.use(express.static('dist'));
app.use(express.static('snapshots'));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/../dist/index.html'))
})

app.get('/capture', (req, res) => {
  console.log(req.query);
  if(req.query.token === '415411018'){
    const puppeteer = require('puppeteer');

    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setViewport({width: 1920, height: 1080});

      await page.tracing.start({path: 'trace.json', screenshots: true});
      await page.goto(req.query.url, {waitUntil: 'networkidle', networkIdleTimeout: 5000});
      await page.tracing.stop();

      await browser.close();
      await fetchTracingData(res);
    })();
  }else{
    res.json({msg: "wrong token"})
  }

})
