const register = require("express").Router();
const logger = require("../libs/logger");
const make_string = require("sprintf-js").sprintf;
const { encrypt, decrypt } = require("../libs/genkey");
const { Base64 } = require("js-base64");
const emailSafe = require('email-validator')
const ipSafe = require('ip-validator')

/**
 * @api {post} http://localhost/register?nick={nick}&ip={ip}&password={pass} Register a user
 * @apiVersion 1.0.0
 * @apiName RegisterUser
 * @apiGroup User
 * @apiDescription
 *
 * Register a user into database
 * @apiParam {String} nick=null nickname for this user
 * @apiParam {String} ip=null hostname for this user
 * @apiParam {String} password=null password for this user
 *
 * @apiSuccess {JSON} JSON Returns a JSON Object
 * @apiSuccessExample {JSON} Example:
 *
 * HTTP/1.1 201 Created
 * {
 *      "success": "Created"
 * }
 * @apiExample {url} Request example:
 *
 * http://localhost/register?nick=foo&ip=127.0.0.1&password=bar&email=email
 *
 * @apiError {JSON} BadRequest If some params is not provide
 * @apiError {JSON} Conflict If user already exists
 * @apiError {JSON} InternalServerError If a error ocurred while registration process
 * @apiErrorExample {JSON} Example:
 * HTTP/1.1 500 Internal Server Error
 * {
 *      "error": "Internal Server Error"
 * }
 */
register.post("/", (req, res, next) => {
  if (!req.body.nick || !req.body.ip || !req.body.password || !req.body.email) {
    res.status(400);
    res.json({ title: 'Error', error: "Bad request" });
    return;
  }
  /**
  * detect XSS injection and parsing data from body request
  */

  const i = new String(req.body.ip).toString().replace('<', '', '>', '');
  const n = new String(req.body.nick).toString().replace('<', '', '>', '');
  const p = new String(req.body.password).toString().replace('<', '', '>', '');
  const e = new String(req.body.email).toString().replace('<', '', '>', '');

  if (!ipSafe.ipv4(i) && !ipSafe.ipv6(i) && !emailSafe.validate(e)) {
    res.status(400);
    res.json({ title: 'Error', error: "Bad request" });
    return;
  }

  const n_re = new RegExp('^[A-Za-z0-9]+$', 'g');

  if (!n.match(n_re)) {
    res.status(400);
    res.json({ title: 'Error', error: "Bad request" });
    return;
  }

  const nick = encrypt(n).value;
  const path = safeURL(Base64.encode(n));
  const host = encrypt(i).value;
  const pass = encrypt(p).value;
  const email = encrypt(e).value;

  if (!resolveUser(path)) {
    createUser(
      path,
      {
        nick: nick,
        host: host,
        date: new Date().getTime(),
        password: pass,
        email: email
      },
      res
    );
  } else {
    res.status(409);
    res.json({
      error: "Conflict"
    });
  }
});
/**
 * Replace '/' char introduced by AES (or Base64) with '@'
 * for make an valid path. 
 */
function safeURL(p) {
  return new String(p).toString().replace("/", "@");
}

function resolveUser(path) {
  const fs = require("fs");
  return fs.existsSync(make_string("%s/.users/%s.json", process.cwd(), path));
}

function createUser(path, opts, res) {
  const fs = require("fs");
  var user = JSON.stringify(opts);
  fs.access(
    make_string("%s/.users/%s.json", process.cwd(), path),
    fs.constants.F_OK,
    err => {
      if (err) {
        switch (err.code) {
          case "ENOENT":
            fs.writeFileSync(
              make_string("%s/.users/%s.json", process.cwd(), path),
              user,
              {
                mode: fs.constants.S_IRWXU,
                flag: "w",
                encoding: "utf8"
              }
            );
            res.status(201);
            res.json({ success: "Created" });
            break;
          default:
            res.status(500);
            res.json({ error: "Internal Server Error" });
        }
      }
    }
  );
}

function getUserInfo(n, cmd) {
  var o = undefined;

  const fs = require("fs");

  const data = fs.readFileSync(
    make_string("%s/.users/%s.json", process.cwd(), n),
    { encoding: "utf8", flag: "r" }
  );

  o = JSON.parse(data);

  return cmd != "all"
    ? {
      success: "Query OK",
      value:
        cmd != 'date' ? decrypt(o[cmd]).value : o[cmd]
    }
    : showAll(n, o);
}

function showAll(n, o) {

  let u = {};

  for (const key in o) {
    u[key] = (key != 'date' ? decrypt(o[key]).value : o[key]);
  }
  return u;
}

function authUser(user, key) {
  /**
   * Validate tokens send by 'user'
   * if 'key' is valid, return true.
   * if 'key' is invalid, return false
   */

  var o = undefined;

  const fs = require("fs");

  const data = fs.readFileSync(
    make_string("%s/.users/%s.json", process.cwd(), user),
    { encoding: "utf8", flag: "r" }
  );

  o = JSON.parse(data);

  const oauth = decrypt(o.password).value;

  return oauth == key ? true : false;
}

function deleteUser(res, path) {

  const fs = require("fs");

  fs.unlink(make_string('%s/.users/%s.json', process.cwd(), path), (e) => {
    if (e) {
      res.status(500)
      res.json({ error: 'Internal Server Error' })
      return
    }
    res.status(200)
    res.json({ success: 'OK' })
  })
}

module.exports = register;
module.exports.resolveUser = nick => {
  return resolveUser(nick);
};
module.exports.authUser = (u, t, r) => {
  return authUser(u, t, r);
};
module.exports.getUserInfo = (k, cmd, n) => {
  return getUserInfo(k, cmd, n);
};
module.exports.deleteUser = (res, path) => {
  return deleteUser(res, path);
};
module.exports.safeURL = u => {
  return safeURL(u);
};
