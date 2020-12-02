const express = require("express");
const rfs = require("rotating-file-stream");
const logger = require("morgan");
const path = require("path");
const fs = require("fs-extra");
const cors = require("cors");
const addRequestId = require("express-request-id")();
const morganBody = require("morgan-body");
const bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(addRequestId);
morganBody(app);

var logDirectory = path.join(__dirname, "./log");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = rfs.createStream("access.log", {
  size: "100MB",
  interval: "1d",
  path: logDirectory,
});

logger.token("custom_token", (req, res) => JSON.stringify(req.body));
logger.token(
  "custom_date",
  () => new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
);

var preFormat = ":custom_date :custom_token";
app.use(logger(preFormat, { stream: accessLogStream }));

app.post("/", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, world!");
});

var server = app.listen(process.env.PORT || 3000, function () {
  console.log("PORT: %d", server.address().port);
});
