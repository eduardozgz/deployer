#!/usr/bin/env node
require("dotenv").config();
const { PORT, SECRET, REPO_NAME, BRANCH } = process.env;
const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const childProcess = require("child_process");

const app = express();

app.use(bodyParser.json());

app.post("/deploy", (req, res) => {
    console.log("Webhook received");

    if (req.get("x-hub-signature") === signData(SECRET, JSON.stringify(req.body))) {
        console.log("Authorized ✔");

        const branchName = req.body.ref.split("/")[req.body.ref.split("/").length - 1];

        if (branchName === BRANCH && req.body.repository.name === REPO_NAME) {
            console.log("Deploy requested, attemping to run script...");
            childProcess.execFile("./deploy.sh", (error, stdout, stderr) => {
                if (error) throw error;
                console.log(stdout);
              });
        }
    } else {
        console.log("Unauthorized ❌");
    }
});

app.listen(PORT, () => {
    console.log("Port:", PORT);
});

//https://github.com/Gisonrg/express-github-webhook/blob/master/index.js
function signData(secret, data) {
    return (
        "sha1=" +
        crypto
            .createHmac("sha1", secret)
            .update(data)
            .digest("hex")
    );
}
