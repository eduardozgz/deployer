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
    const branch_name = data.ref.split("/")[data.ref.split("/").length-1]
    console.log(branch_name);
    
});

app.listen(PORT, () => {
    console.log("Port:", PORT);
});
