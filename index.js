require("dotenv").config();
const { PORT, SECRET } = process.env;
const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const GithubWebHook = require("express-github-webhook");
const childProcess = require("child_process");

const app = express();
let webhookHandler = GithubWebHook({ path: "/deploy", secret: SECRET });

app.use(bodyParser.json());
app.use(webhookHandler);

webhookHandler.on("push", (repoName, data) => {
    console.log(data)
});

app.listen(PORT, () => {
    console.log("Port:", PORT);
});
