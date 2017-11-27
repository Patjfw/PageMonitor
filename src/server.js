var express = require('express');
var path = require('path');
var fs = require("fs")
var record;

const blank = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAF8AqMDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//9k=';


var port = process.argv[2] || 3000;
var app = express()

var server = app.listen(port, function(){
});

var clearTrace = function(){
  fs.access("../PageMonitor/trace.json", (err) => {
    // handle result
    if(!err){
      console.log("old trace exists");
      fs.unlink("../PageMonitor/trace.json", err => {
        if (err) throw err;
      });
    }else{
      console.log("no such file");
    }
  });
  return 1;
}

var clearCache = function(){
  const path = require('path');

  const directory = './dist/snapshots';


  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
  return 1;
}

var fetchTracingData = function(res){
    fs.readFile('../PageMonitor/trace.json', 'utf8', function(err, data){
      if(err){
        console.log('fetch error');
      }else{
        record = JSON.parse(data);
        var start = record["traceEvents"][0];
        var snapshots = record["traceEvents"].filter((item) => {
          return item.cat === "disabled-by-default-devtools.screenshot";
        })

        var imagesURL = [];
        var blankPage = true;

        for(let i = 0 ; i < snapshots.length; i++){

          if(blankPage && snapshots[i]["args"]["snapshot"] !== blank){
            imagesURL.push("../snapshots/blank_"+ (snapshots[i]["ts"] - start["ts"]) +".png");
            fs.writeFile('./dist/snapshots/blank_'+(snapshots[i]["ts"] - start["ts"]) +".png", snapshots[i]["args"]["snapshot"], 'base64',
            function(err) {

            });
            blankPage = false;
          }else{
            imagesURL.push("../snapshots/"+ (snapshots[i]["ts"] - start["ts"]) +".png");
            fs.writeFile('./dist/snapshots/'+(snapshots[i]["ts"] - start["ts"]) +".png", snapshots[i]["args"]["snapshot"], 'base64',
            function(err) {

            });
          }
        }
        console.log('fetch done!');
        setTimeout(function(){
          res.json({urls: imagesURL});
        }, 3000);
      }
    });

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
      await clearTrace();
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setViewport({width: 1920, height: 1080});

      await page.tracing.start({path: 'trace.json', screenshots: true});
      await page.goto(req.query.url, {waitUntil: 'networkidle', networkIdleTimeout: 1000});
      await page.tracing.stop();

      await browser.close();
      await clearCache();
      await fetchTracingData(res);
    })();
  }else{
    res.json({msg: "wrong token"})
  }

})
