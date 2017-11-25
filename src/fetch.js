var record = require('../trace.json');
var fs = require("fs")
const path = require('path');

const directory = 'snapshots';

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

for(let i = 0 ; i < snapshots.length; i++){
  fs.writeFile("./"+ directory +"/"+ (snapshots[i]["ts"] - start["ts"]) +".png", snapshots[i]["args"]["snapshot"], 'base64',
  function(err) {

  });
}
