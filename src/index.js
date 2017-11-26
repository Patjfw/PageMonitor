const axios = require('axios');
const url = document.querySelector("#url");
const token = document.querySelector("#token");
const capture = document.querySelector("#capture");

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
        let container = document.createElement('div');
        for(let i = 0; i<res.data.urls.length; i++){
          let img = document.createElement('img');
          img.src = res.data.urls[i];
          img.width = 80;
          img.height = 45;
          container.appendChild(img);
        }
        document.body.appendChild(container);
      }
    });
  }

})
