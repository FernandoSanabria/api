const events = require("express").Router();
const logger = require("../libs/logger");
const { sprintf } = require("sprintf-js");
const registerManager = require("./register");
const { Base64 } = require("js-base64");
const fs = require("fs");
const { encrypt, decrypt } = require("../libs/genkey");
const fileManager = require("multer");
const path = require("path");
/**
 * Magic number for sanity uploads images files
 */
const magicNumbers = {
  "image/gif": {
    len: 6,
    header: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
    ],
    mime: "image/gif"
  },
  "image/jpeg": {
    len: 2,
    header: [0xff, 0xd8],
    footer: [0xff, 0xd9],
    mime: "image/jpeg"
  },
  "image/png": {
    len: 8,
    header: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    mime: "image/png"
  }
};

/**
 * Params:
 *   admin = User Admin
 *   dateOf = Date of event
 *   title = Event title
 *   desc = Descripton for this event
 *   where = Where is this event?
 *   timeOf = Times for this event
 *   duration = Duration for this event
 *   =============
 *   SPECIALS PARAMS
 *   =============
 *   files = Images for this event
 */

events.get("/", (req, res, next) => {
  res.render("events", { title: "Events" });
});

events.get("/get", (req, res, next) => {
  res.render("list-events", { title: "All events" });
});

function parseFiles(fs, files) {
  const mimetype = {
    ".png": "data:image/png;base64,",
    ".jpeg": "data:image/jpeg;base64,",
    ".gif": "data:image/jpeg;base64,"
  };

  var objects = [];

  console.log('sending '+files.length+' files')

  for (let index = 0; index < files.length; index++) {
    const element = files[index];

    const data = fs.readFileSync(
      sprintf("%s/.events/%s", process.cwd(), element),
      { encoding: "utf8", flag: "r" }
    );
    var imgArray = [];
    var o = {};
    o = JSON.parse(data);
    o.name = Base64.decode(o.name);
    let len = o.imgs.length;
    for (let index = 0; index < len; index++) {
      const element = o.imgs[index];
      var a = Buffer.from(
        fs.readFileSync(path.resolve(sprintf("%s/%s", process.cwd(), element)))
      );
      imgArray.push(
        sprintf("%s%s", mimetype[path.parse(element).ext], a.toString("base64"))
      );
    }
    o.imgs = imgArray;
    objects.push(o);
  }
  return objects;
}

events.post("/upload", fileManager().array("img[]"), (req, res, next) => {
  if (
    !req.body.title ||
    !req.body.desc ||
    !req.body.datetime ||
    !req.body.where ||
    !req.body.address
  ) {
    res.status(400);
    res.render("error", { title: "Error", message: "Bad request" });
    return;
  }
  if (!req.files.length) {
    res.status(400);
    res.render("error", { title: "Error", message: "Need images." });
    return;
  }

  let countOK = 0;
  let countFAIL = 0;

  let json = {
    name: Base64.encode(new Date().getTime()),
    title: req.body.title,
    desc: req.body.desc,
    date: req.body.datetime,
    where: req.body.where,
    address: req.body.address
  };
  let arrayImgs = [];

  for (let i = 0; i < req.files.length; i++) {
    const filename = new String(req.files[i].originalname).toString();
    const mime = req.files[i].mimetype;
    const buffer = Buffer.from(req.files[i].buffer);

    if (sanityFile(filename, mime, buffer)) {
      const format = mime.split("/")[1];
      const path = sprintf(
        ".images/%s.%s",
        Base64.encode(sprintf("%s-%d", filename, new Date().getTime())),
        format
      );
      arrayImgs.push(path);
      saveImg(path, buffer);
    }
  }
  json.imgs = arrayImgs;
  saveEvent(json);
  res.send(sprintf("result => corrupted: %d, sanity: %d", countFAIL, countOK));
  console.log(req.body);
});

function saveEvent(json) {
  fs.writeFileSync(
    sprintf("%s/.events/%s.json", process.cwd(), json.name),
    JSON.stringify(json)
  );
}

function saveImg(path, buffer) {
  fs.writeFileSync(path, buffer);
}

function sanityFile(f, m, b) {
  const hBuffer =
    typeof magicNumbers[m].header[0][1] != "undefined"
      ? Buffer.from(magicNumbers[m].header[0])
      : Buffer.from(magicNumbers[m].header);
  const hBuffer2 =
    typeof magicNumbers[m].header[0][1] == "undefined"
      ? 0
      : Buffer.from(magicNumbers[m].header[1]);
  const fBuffer = !magicNumbers[m].footer
    ? 0
    : Buffer.from(magicNumbers[m].footer);
  const len = magicNumbers[m].len;

  if (hBuffer2 != 0) {
    if (hBuffer.compare(b, 0, len) != 0 && hBuffer2.compare(b, 0, len) != 0) {
      return false;
    }
  } else {
    if (hBuffer.compare(b, 0, len) != 0) {
      return false;
    }
  }
  return true;
}

module.exports = events;
module.exports.getEvents = socket => {
  var o = {};
  fs.readdir(
    sprintf("%s/.events", process.cwd()),
    { encoding: "utf8" },
    (e, files) => {
      if (e) {
        o.error = "Internal Server Error";
        socket.emit("events", o);
        return;
      }
      if (!files.length) {
        o.error = "Service Unavailable";
        console.log('service unavailable')
        socket.emit("events", o);
        return;
      }
      o.success = "OK";
      o.value = parseFiles(fs, files);
      socket.emit("events", o);
    }
  );
};
