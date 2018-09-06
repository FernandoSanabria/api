/**
 * Only available on Linux, Fuck you Bill.
 */
const fs = require("fs");
const Canvas = require("canvas");
const { sprintf } = require("sprintf");

const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

module.exports = opts => {
  let ctx = new Canvas(opts.w, opts.h);
  let canvas = ctx.getContext("2d");
  canvas.textAlign = "center";
  canvas.fillText(opts.text, parseInt(opts.w / 2), parseInt(opts.w / 2));
  canvas.font = "bold 15px monospace";
  canvas.fillStyle = "#fff";
  return sprintf(
    "data:image/png;base64,%s",
    Buffer.concat([bc, b]).toString("base64")
  );
};
