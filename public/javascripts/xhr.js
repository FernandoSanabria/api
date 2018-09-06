(function(doc) {
  var ctEvent = document.getElementById("container_event");
  /*var btn = document.getElementById("getimg");
  btn.addEventListener("click", () => {
    var request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState == 4) {
        if (request.status == 200) {
          parseRequest(request.responseText, ctEvent);
        }
      }
    };
    request.open("GET", "/events/list/", true);
    request.send();
  });*/

  var http = io()

  http.emit('get-events')

  http.on('events',(ev) => {
    if (!ev.success)
    {
      console.log(ev.error)
    } else {
      console.log('Request is '+ev.success)
      parseRequest(ev.value, ctEvent)
    }
  })
})(document);

function parseRequest(data, container) {

  data = JSON.parse(data)
  data.imgs.forEach(element => {
    var img = document.createElement("img");
    img.src = element;
    img.alt = "Image from XHR";
    img.width = 100;
    img.height = 80;
    container.appendChild(img);
  });
}
