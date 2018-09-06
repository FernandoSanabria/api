const httpError = require("http-errors");
const rest = require("express");

/**
 * Routes
 */
const register = require("./routes/register");
const home = require("./routes/home");
const users = require("./routes/users");
const wiki = require("./routes/wiki");
const cms = require("./routes/cms");
const reports = require('./routes/reports')
const events = require('./routes/events')

/**
 * Libs
 */

const morgan = require("morgan");
const parser = require("body-parser");
const path = require("path");
const sassMiddleware = require("node-sass-middleware");
const helmet = require('helmet')
const app = rest();

/**
 * Sass
 */
app.use(
  sassMiddleware({
    src: path.join(__dirname, "sass"),
    dest: path.join(__dirname, "public/stylesheets"),
    sourceMap: true,
    indentedSyntax: true,
    force: true,
    prefix: "/stylesheets",
    outputStyle: "compressed"
  })
);

/**
 * Restringuimos cada 'query' a 'case-sensitive'
 * util para obligar a los clientes a realizar
 * peticiones con URL's correctas y especificas
 *
 * Ejemplo:
 *          GET => /users  Good
 *          GET => /USERS  Wrong
 */

app.enable("case sensitive routing");

/**
 * Disable 'X-Powered-By'
 */
app.disable('x-powered-by')

/**
 * Obligamos al cliente a realizar peticiones
 * con URL's absolutas
 *
 * Ejemplo:
 *          GET => /users Good
 *          GET => /users/ Wrong
 */

app.set("strict routing", true);

// view engine setup
app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "pug");

/**
 * Encode URL's
 */
app.use(parser.urlencoded({ extended: true }));

/**
 * Parse body reqs from POST method
 */
app.use(parser.json());

app.use(
  rest.static(
    path.join(__dirname, 'public')
  )
);

/**
 * 
 */
app.use(helmet())

/**
* Debug in dev env
*/
app.use(morgan("dev"));

/**
 * Routes
 */
app.use("/register", register);
app.use("/users", users);
app.use("/", home);
app.use("/wiki", wiki);
app.use("/cms", cms);
app.use("/reports", reports);
app.use('/events', events)

/*
Validar errores
*/
app.use((req, res, next) => {
  next(httpError(404));
});

/**
 * Gestionar errores
 */
app.use((err, req, res, next) => {
  switch (parseInt(err.status)) {
    case 404:
      res.status(404);
      res.render("404");
      break;
    default:
      res.status(500);
      res.render("error", { message: "Internal Server Error" });
      console.log(err.stack)
      break;
  }
});

module.exports = {
  App: app
};
