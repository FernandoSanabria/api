(function(doc) {
  if (doc.forms.newEvent) {
    var cities = [
      "Bogotá D.C.",
      "Barranquilla",
      "Cartagena",
      "Medellín",
      "Pereira",
      "Armenia",
      "Manizales",
      "Cali"
    ];
    cities = cities.sort();

    for (let index = 0; index < cities.length; index++) {
      const element = cities[index];
      let opt = document.createElement("option");
      opt.value = element;
      opt.innerText = element;
      doc.forms.newEvent.where.options.add(opt);
    }
    doc.forms.newEvent.addEventListener("submit", e => {
      e.preventDefault();
      if (!doc.forms.newEvent.title.value || !doc.forms.newEvent.desc.value) {
        alert("Please, get me a title or desc!");
        return;
      }
      if (
        doc.forms.newEvent.title.value.length > 60 ||
        doc.forms.newEvent.desc.value.length > 300
      ) {
        alert(
          'Content for "title" or "desc" out of range"\nTitle length: 60\nDesc length: 300'
        );
        return;
      }
      if (!doc.forms.newEvent["img[]"].files.length) {
        alert("This event require images, please upload any image.");
        return;
      }
      if (!doc.forms.newEvent.datetime.value.length) {
        alert("Set a valid date. (dd/mm/aaaa)\n");
        return;
      }
      if (doc.forms.newEvent.datetime.value.length == 10) {
        if (
          !doc.forms.newEvent.datetime.value.match(
            new RegExp("([0-9]{4})\\-([0-9]{2})\\-([0-9]{2})", "g")
          )
        ) {
          alert("Set a valid date. (dd/mm/aaaa)\n");
          return;
        }
      }
      if (!doc.forms.newEvent.address.value.length) {
        alert("Address not provided");
        return;
      }
      e.target.submit();
    });
    doc.getElementById("imgEvent").addEventListener(
      "change",
      e => {
        let loader = doc.getElementById("progress");

        let files = e.target.files;
        //container to place selected imgs
        var ctn = doc.getElementById("imgContainer");
        //legend not visible
        doc.getElementById("noImgLegend").style.display = "none";

        for (let i = 0, f = undefined; (f = files[i]); i++) {
          switch (f.type) {
            case "image/jpeg":
            case "image/png":
            case "image/gif":
              let reader = new FileReader();
              reader.readAsDataURL(f);
              reader.onloadstart = r => {
                loader.setAttribute(
                  "data-load",
                  sprintf("Loading file: %s", f.name)
                );
              };
              reader.onloadend = r => {
                loader.setAttribute(
                  "data-load",
                  sprintf("Loading file complete: %s", f.name)
                );
              };
              reader.onerror = e => {
                loader.setAttribute(
                  "data-load",
                  sprintf("Error loading file: %s", f.name)
                );
              };
              reader.onprogress = p => {
                loader.max = p.total;
                loader.setAttribute(
                  "data-load",
                  sprintf(
                    "Loading %s... (%d%%)",
                    f.name,
                    Math.floor((p.loaded * 100) / p.total)
                  )
                );
                loader.value = p.loaded;
              };
              reader.onload = r => {
                let img = doc.createElement("img");
                img.src = r.target.result;
                img.classList.add("thumb");
                ctn.appendChild(img);
                loader.setAttribute(
                  "data-load",
                  "All images loaded successfully"
                );
              };
              reader.onerror = e => {
                console.log("A error occured "+e.error);
              };
              break;
            default:
              break;
          }
        }
      },
      false
    );
  }
})(document);
