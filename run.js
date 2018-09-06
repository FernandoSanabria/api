const server = require("http");
const { App } = require("./index");
const logger = require("./libs/logger");
const make_string = require("sprintf-js").sprintf;
const fs = require("fs");
const promiseLoader = require("ora")({ spinner: "dots", color: "green" });
const { initCipher } = require("./libs/genkey");
const events = require('./routes/events')

const folders = [
  ".users",
  ".metadata",
  ".reports",
  ".wiki",
  ".events",
  ".feedbacks",
  ".images"
];

const promiseInit = new Promise((s, f) => {
  promiseLoader.start("Validate CLI arguments...");
  setTimeout(() => {
    const argv = process.argv.slice(2);

    if (argv.length) {
      promiseLoader.succeed("Validate CLI arguments");
      argv.forEach(e => {
        switch (e) {
          case "--init":
            promiseLoader.start(make_string("Parse command: %s", e));
            for (let index = 0; index < folders.length; index++) {
              const folder = folders[index];
              try {
                fs.accessSync(
                  make_string("%s/%s", process.cwd(), folder),
                  fs.constants.F_OK
                );
              } catch (e) {
                switch (e.code) {
                  case "ENOENT":
                    fs.mkdir(
                      make_string("%s/%s", process.cwd(), folder),
                      fs.constants.S_IRWXU,
                      e => {
                        if (e) {
                          promiseLoader.fail(
                            make_string("Parse command: %s", e)
                          );
                          f(e.message);
                          process.exit(-1);
                        }
                        if (folder == ".metadata") {
                          fs.mkdir(
                            make_string("%s/%s/admins", process.cwd(), folder),
                            fs.constants.S_IRWXU,
                            e => {
                              if (e) {
                                promiseLoader.fail(
                                  make_string("Parse command: %s", e)
                                );
                                f(e.message);
                                process.exit(-1);
                              }
                            }
                          );
                          fs.mkdir(
                            make_string(
                              "%s/%s/requirements",
                              process.cwd(),
                              folder
                            ),
                            fs.constants.S_IRWXU,
                            e => {
                              if (e) {
                                promiseLoader.fail(
                                  make_string("Parse command: %s", e)
                                );
                                f(e.message);
                                process.exit(-1);
                              }
                            }
                          );
                        }
                      }
                    );
                    break;
                  default:
                    promiseLoader.fail(make_string("Parse command: %s", e));
                    f(e.message);
                    process.exit(-1);
                }
              }
            }
            promiseLoader.succeed(make_string("Parse command: %s", e));
            break;
          default:
            promiseLoader.warn(make_string("Ignore command: %s", e));
            break;
        }
      });
      promiseLoader.start("Validate cipher...");
      if (!initCipher()) {
        promiseLoader.fail("Validate cipher...");
        f("Failed to init cipher.");
      }
      promiseLoader.succeed("Validate cipher...");
      s("ALL RIGHT!");
    } else {
      promiseLoader.fail("Validate cli arguments");
      f("You need say me what make!");
    }
  }, 2000);
});

promiseInit
  .then(s => {
    logger(s);
    logger("Server start success.");
    logger(make_string("Platform: %s", process.platform));
    logger(make_string("Arch: %s", process.arch));
    logger(make_string("App path: %s", process.cwd()));
    logger(make_string("PID: %s", process.pid));
    logger("Listening client for now...");
  })
  .catch(e => {
    logger(make_string("[ERROR]: => %s", e));
    process.exit(0);
  });

const options = {
  key: fs.readFileSync(make_string('%s/ssl/api-key.pem', process.cwd())),
  cert: fs.readFileSync(make_string('%s/ssl/api-cert.pem', process.cwd()))
}

const APIServer = server.createServer(App);
const io = require('socket.io')(APIServer)
APIServer.listen(3002);
APIServer.on("connection", c => {
  logger(
    make_string(
      "Connection incomming from: %s:%s",
      c.remoteAddress,
      c.remotePort
    )
  );
});
APIServer.on("error", error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  switch (error.code) {
    case "EACCES":
      console.error("this script requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error("ip or port is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
});

io.on('connection', (s) => {
  console.log('new connection')
  s.on('get-events', (o)=>{
    console.log('received get-events from client.')
    events.getEvents(s);
  })
})

