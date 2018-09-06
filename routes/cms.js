const cms = require("express").Router();
const logger = require("../libs/logger");
const { sprintf } = require("sprintf-js");
const registerManager = require("./register");
const { Base64 } = require("js-base64");
const fs = require("fs");
const { encrypt, decrypt } = require("../libs/genkey");
const emailSafe = require("email-validator");

/**
 * @api {get} http://localhost/cms/ Admin login
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Admin
 * @apiPermission root
 *
 * @apiDescription
 *  Admin login page
 *
 * @apiSuccess {HTML} HTML Returns a Admin login Home
 *
 */
cms.get("/", (req, res, next) => {
  res.status(200);
  res.render("index", { title: "UnderNode API REST" });
});

cms.post("/auth", (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(401);
    res.render("error", { title: "Error", message: "Unauthorized" });
    return;
  } else {
    const n_re = new RegExp("^[A-Za-z0-9]+$", "g");
    const p = new String(req.body.password)
      .toString()
      .replace("<", "", ">", "");
    const u = new String(req.body.username)
      .toString()
      .replace("<", "", ">", "");
    if (!u.match(n_re)) {
      res.status(400);
      res.render("error", { title: "Error", message: "Bad request" });
      return;
    }
    try {
      fs.accessSync(
        sprintf("%s/.metadata/admins/%s.json", process.cwd(), Base64.encode(u)),
        fs.constants.F_OK
      );
      const data = fs.readFileSync(
        sprintf("%s/.metadata/admins/%s.json", process.cwd(), Base64.encode(u)),
        { encoding: "utf8", flag: "r" }
      );
      const rootCredentials = JSON.parse(data);

      if (p !== decrypt(rootCredentials.password).value) {
        res.status(403);
        res.render("error", { title: "Error", message: "Forbidden" });
        return;
      }
      res.status(200);
      res.render("dashboard", { title: "Dashboard" });
    } catch (error) {
      res.status(403);
      res.render("error", { title: "Error", message: "Forbidden" });
    }
  }
});

cms.get("/sign-up", (req, res, next) => {
  fs.readdir(sprintf("%s/.metadata/admins", process.cwd()), (e, files) => {
    if (e) {
      res.status(500);
      res.render("error", { title: "Error", message: "Internal Server Error" });
      return;
    }
    if (!files.length) {
      res.status(200);
      res.render("sign-up", { title: "Sign up now", rootUser: true });
      return;
    }
    res.status(200);
    res.render("require-regs", { title: "Request register" });
  });
});

cms.post("/recovery", (req, res, next) => {});
cms.post("/register", (req, res, next) => {
  if (
    !req.body.username ||
    !req.body.password ||
    !req.body.cpassword ||
    !req.body.age ||
    !req.body.email
  ) {
    res.status(400);
    res.render("error", { title: "Error", message: "Bad Request" });
    return;
  } else {
    //validate fields before parsing data... (ok)

    const u = new String(req.body.username)
      .toString()
      .replace("<", "", ">", "");
    const p = new String(req.body.password)
      .toString()
      .replace("<", "", ">", "");
    const c = new String(req.body.cpassword)
      .toString()
      .replace("<", "", ">", "");
    const a = new Number(req.body.age);
    const e = new String(req.body.email).toString().replace("<", "", ">", "");

    const u_re = new RegExp("^[A-Za-z0-9]+$", "g");

    if (!u.match(u_re) || isNaN(a) || p !== c || !emailSafe.validate(e)) {
      res.status(400);
      res.render("error", { title: "Error", message: "Bad Request" });
      return;
    }

    var root = {};
    for (const param in req.body) {
      root[param] = encrypt(req.body[param]).value;
    }
    const data = JSON.stringify(root);
    fs.writeFileSync(
      sprintf("%s/.metadata/admins/%s.json", process.cwd(), Base64.encode(u)),
      data,
      { encoding: "utf8", mode: fs.constants.S_IRWXU, flag: "w" }
    );
    try {
      fs.accessSync(
        sprintf("%s/.metadata/admins/%s.json", process.cwd(), Base64.encode(u)),
        fs.constants.F_OK
      );
      res.status(200);
      res.render("confirm", { title: "Congrats!" });
    } catch (error) {
      res.status(500);
      res.render("error", { title: "Error", message: "Internal Server Error" });
    }
  }
});

module.exports = cms;
