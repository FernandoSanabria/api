/**
 *  @apiDefine root RootUser Require root permission
 */

const users = require("express").Router();
const logger = require("../libs/logger");
const { Key } = require("../libs/genkey");
const make_string = require("sprintf-js").sprintf;
const registerManager = require("./register");
const { Base64 } = require("js-base64");



/**
 * @api {get} http://localhost/:nick?key={key}&request={command} User commands
 * @apiVersion 1.0.0
 * @apiName Commands
 * @apiGroup User
 * @apiDescription Commands availables for users request.
 * 
 * @apiParam {String} nick Get nickname
 * @apiParam {String} host Get hostame
 * @apiParam {String} date Get register date
 * @apiParam {String} all Get all info for this user
 * @apiExample {JSON} Usage:
 * 
 * http://localhost/pepito?key=Aert87/&655!?&request=date
 * 
 * HTTP/1.1 200 OK
 * {
 *      "success": "Query OK",
 *      "value": 1245987548725
 * }
 * 
 * -- Apply same syntax for all commands
 */
const user_request = ["nick", "host", "date", "all"];

/**
 * @api {get} http://localhost/users/ Get user home
 * @apiVersion 1.0.0
 * @apiName Home
 * @apiGroup Home
 *
 * @apiDescription 
 * This route handle request for 'home' dir.
 * but, nothing serve here.
 * 
 * @apiSuccess {JSON} JSON Returns a JSON Object
 * @apiExample {JSON} Example response:
 * 
 * HTTP/1.1 401 Unauthorized
 * {
 *      "error": "Unauthorized"
 * }
 */
users.get("/", (req, res, next) => {
  res.status(401);
  res.json({ error: "Unauthorized" });
});

/**
 * @api {get} http://localhost/users/:nick Get info about a user
 * @apiVersion 1.0.0
 * @apiName GetUser
 * @apiGroup User
 * @apiParam {String} key=null Token for this user
 * @apiParam {String} request=null Command
 * @apiDescription 
 * This route handle request for returns info about a user
 * @apiSampleRequest http://localhost/users/foo?key=bar&request=all
 * @apiSuccess {Object} JSON Returns a JSON Object
 * @apiExample {JSON} Example response:
 * 
 * HTTP/1.1 200 OK
 * {
 *      "success": "Query OK",
 *      "value": request_data
 * }
 * @apiParamExample {url} Request example
 * 
 *  http://localhost/users/foo?key=bar&request=all
 * 
 * @apiError Unauthorized If auth token is failed.
 * @apiError BadRequest If query is wrong
 * @apiError NotFound If this user not exists
 * 
 * @apiErrorExample {JSON} Example response
 * 
 * HTTP/1.1 401 Unauthorized
 * {
 *      "error": "Unauthorized"
 * }
 * HTTP/1.1 400 Bad request
 * {
 *      "error": "Bad request"
 * }
  * HTTP/1.1 404 Not found
 * {
 *      "error": "Not found"
 * }
 */
users.get("/:nick", (req, res, next) => {
  if (!req.query.key || !req.query.request) {
    res.status(400);
    res.json({ error: "Bad request" });
    return;
  }


  const path      = registerManager.safeURL(Base64.encode(new String(req.params.nick).toLowerCase()));

  if (registerManager.resolveUser(path)) {
    if (!registerManager.authUser(path, req.query.key)) {
      res.status(401);
      res.json({ error: "Unauthorized" });
      return;
    }

    for (let index = 0; index < user_request.length; index++) {
      if (user_request[index] == req.query.request.toLowerCase()) {
        var o = registerManager.getUserInfo(
          path,
          user_request[index]
        );
        res.json(o);
        return;
      }
    }
    res.status(400);
    res.json({ error: "Bad request" });
  } else {
    res.status(404)
    res.json({ error: "Not found" });
  }
});


/**
 * @api {delete} http://localhost/users/:nick?key={key} Delete a users
 * @apiVersion 1.0.0
 * @apiName Delete User
 * @apiGroup User
 * 
 * @apiDescription 
 * Delete a specified user by nick
 * 
 * @apiParam {String} key The auth token for this user
 * @apiSuccess {JSON} JSON Returns a JSON Object
 * @apiExample {JSON} Example response:
 * 
 * HTTP/1.1 200 OK
 * {
 *      "success": "OK"
 * }
 */

users.delete("/:nick", (req, res, next) => {
  if (!req.query.key) {
    res.status(401);
    res.json({ error: "Unauthorized" });
    return;
  }
  const path      = registerManager.safeURL(Base64.encode(new String(req.params.nick).toLowerCase()));
  if (registerManager.resolveUser(path)) {
    if (!registerManager.authUser(path, req.query.key)) {
      res.status(401);
      res.json({ error: "Unauthorized" });
      return;
    }
    registerManager.deleteUser(res, path)
  } else {
    res.status(404)
    res.json({ error: "Not found" });
  }
});

/**
 * Export this module
 */
module.exports = users;
