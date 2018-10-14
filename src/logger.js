var winston = require("winston");
var config = {
  host: "fluent",
  port: 24224,
  timeout: 3.0,
  requireAckResponse: true // Add this option to wait response from Fluentd certainly
};
var fluentTransport = require("fluent-logger").support.winstonTransport();

function createLogger(tag) {
  return winston.createLogger({
    transports: [
      new fluentTransport(tag, config),
      new winston.transports.Console()
    ]
  });
}

module.exports = {
  apiLogger: createLogger("ammobin.api"),
  workerLogger: createLogger("ammobin.worker")
};
