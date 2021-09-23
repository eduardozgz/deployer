#!/usr/bin/env node
const { PORT, SECURE_SERVER, PRIVATE_KEY, CERT } = require("./config.json");
const http = require("http");
const https = require("https");
const requestHandler = require("./requestHandler");

if (SECURE_SERVER) {
  const options = {
    key: fs.readFileSync(PRIVATE_KEY),
    cert: fs.readFileSync(CERT),
  };

  https.createServer(options, requestHandler).listen(PORT, () => {
    console.log("HTTPS SERVER LISTENING @", PORT);
  });
} else {
  http.createServer(requestHandler).listen(PORT, () => {
    console.log("HTTP SERVER LISTENING @", PORT);
  });
}
