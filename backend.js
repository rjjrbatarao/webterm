require("dotenv").config();

const https = require("https");
const fs = require("fs");
const os = require("os");
const pty = require("node-pty");
const path = require("path");
const chalk = require("chalk");
const express = require("express");
const ws = require("express-ws");
const auth = require("basic-auth");
const multer = require("multer");

const app_port = process.env.APP_PORT || 8443;
const app_basicauth = process.env.ENABLE_AUTH || 1;
const app_username = process.env.AUTH_USERNAME || "webterm";
const app_password = process.env.AUTH_PASSWORD || "webterm";
const app_working_directory =
  process.env.APP_WORKING_DIRECTORY || process.env.HOME;
const app_cert_key =
  process.env.SSL_KEY || path.join(__dirname, "/certs/key-rsa.pem");
const app_cert_cert =
  process.env.SSL_CERT || path.join(__dirname, "/certs/cert.pem");

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 206,
  rows: 54,
  cwd: app_working_directory,
  env: process.env,
});

let current_directory = app_working_directory;

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, current_directory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Create the multer instance
const upload = multer({ storage: storage });

const commandProcessor = function (command) {
  return command;
};

const outputProcessor = function (output) {
  /**
   * !matcher for current directory
   */
  let dir = output.match(new RegExp("PS " + "(.*)" + ">"));
  if (dir) {
    current_directory = dir[1].trim();
  }
  return output;
};
const options = {
  key: fs.readFileSync(app_cert_key),
  cert: fs.readFileSync(app_cert_cert),
};
const app = express();
const server = https.createServer(options, app);
const wss = ws(app, server);
if (app_basicauth == 1) {
  app.use((req, res, next) => {
    let user = auth(req);

    if (
      user === undefined ||
      user["name"] !== app_username ||
      user["pass"] !== app_password
    ) {
      res.statusCode = 401;
      res.setHeader("WWW-Authenticate", 'Basic realm="Node"');
      res.end("Unauthorized");
    } else {
      next();
    }
  });
}
app.use("/", express.static(path.join(__dirname, "/public")));

// Set up a route for file uploads
app.post("/upload", upload.array("files"), (req, res) => {
  // Handle the uploaded file
  res.json({ message: "File uploaded successfully!" });
});

app.get("/dl/:file", (req, res) => {
  fs.stat(`${current_directory}\\${req.params.file}`, (err) => {
    if (err) {
      console.log("file not exist");
      res
        .status(200)
        .send(
          '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="2; url=/"></head>FILE NOT FOUND</html>'
        );
      return;
    }
    console.log("file exist");
    res.download(`${current_directory}\\${req.params.file}`);
  });
});

app.get("/lg", (req, res) => {
  res.set("Content-Type", "text/html");
  res
    .status(401)
    .send(
      '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/"></head></html>'
    );
});

app.use(function (req, res, next) {
  var version = "v1.0.0";
  req.banner = `\r
${chalk.green(
  "██╗    ██╗███████╗██████╗"
)} ████████╗███████╗██████╗ ███╗   ███╗\r
${chalk.green(
  "██║    ██║██╔════╝██╔══██╗"
)}╚══██╔══╝██╔════╝██╔══██╗████╗ ████║\r
${chalk.green(
  "██║ █╗ ██║█████╗  ██████╔╝"
)}   ██║   █████╗  ██████╔╝██╔████╔██║\r
${chalk.green(
  "██║███╗██║██╔══╝  ██╔══██╗"
)}   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║\r
${chalk.green(
  "╚███╔███╔╝███████╗██████╔╝"
)}   ██║   ███████╗██║  ██║██║ ╚═╝ ██║\r
${chalk.green(
  " ╚══╝╚══╝ ╚══════╝╚═════╝"
)}    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝\r
 Webterm ${version} @2024 Preparing your terminal                   
 `;
  //next middleware function in the chain is called
  return next();
});

app.ws("/", function (ws, req) {
  //send a simple banner
  ws.send(req.banner);
  setTimeout(() => {
    ptyProcess.resize(206, 54);
  }, 1000);

  //an event listener is set up for incoming WebSocket messages.
  ws.on("message", function (command) {
    if (command.charAt(0) == "\x04") {
      let resize = JSON.parse(command.substring(1));
      ptyProcess.resize(resize.Width, resize.Height);
      return;
    }
    let processedCommand = commandProcessor(command);
    ptyProcess.write(processedCommand);
  });

  ptyProcess.on("data", function (rawOutput) {
    let processedOutput = outputProcessor(rawOutput);
    ws.send(processedOutput);
  });
});

server.listen(app_port, () => {
  console.log("webterm setup started");
  os.platform() === "win32"
    ? require("child_process").exec(`start https://127.0.0.1:${app_port}`)
    : console.log("webterm is running");
});
