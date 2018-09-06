const home = require("express").Router();
const logger = require("../libs/logger");
const make_string = require("sprintf-js").sprintf;

/**
 * @api {get} http://localhost/ Home route
 * @apiVersion 1.0.0
 * @apiName Home Main
 * @apiGroup Home
 *
 * @apiDescription 
 * This route handle request for 'home' dir.
 * but, nothing server here, redirect to '/cms'
 * and available only for admins. Login require
 * 
 * @apiSuccess {HTML} HTML Returns a Login Page

 */
home.get("/", (req, res, next) => {
  res.redirect(301, "/cms");
});

module.exports = home;
