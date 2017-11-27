const axios = require('axios');
const url = document.querySelector("#url");
const token = document.querySelector("#token");
const capture = document.querySelector("#capture");
const container = document.querySelector("#container");

let lock = false;
capture.addEventListener('click', function(){
  if(!lock){
    lock = true;
    axios.get('/capture', {
      params: {
        url: url.value,
        token: token.value
      },
      timeout: 90000
    }).then(function(res){
      lock = false;
      if(res.data.urls){
        let blank = /$(blank)w+/g
        container.innerHTML = "";
        let frag = document.createDocumentFragment();
        for(let i = 0; i<res.data.urls.length; i++){
          let inner = document.createElement('div');
          inner.className = "inner";
          let p = document.createElement('p');
          let img = document.createElement('img');
          img.src = res.data.urls[i];
          if(res.data.urls[i].search('blank') > -1){
            img.className = "blank";
          }
          img.width = 192;
          img.height = 108;
          // console.log(res.data.urls[i].split("/").slice(-1)[0].slice(0, -4));
          inner.appendChild(p);
          inner.appendChild(img);
          p.innerHTML = (parseInt(res.data.urls[i].split("/").slice(-1)[0].slice(0, -4).replace(/(blank_)/i, ''))/1000) + "ms"
          frag.appendChild(inner);
        }
        container.appendChild(frag);
      }
    });
  }

})
