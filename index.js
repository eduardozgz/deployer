#!/usr/bin/env node
require("dotenv").config();
const { PORT, SECRET } = process.env;
const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const childProcess = require("child_process");
const bufferEq = require('buffer-equal-constant-time');

const app = express();;

app.use(bodyParser.json());

app.post("/deploy", (req, res) => {
    console.log("Webhook received");
    const verified = req.headers['X-Hub-Signature'] === signData(SECRET, JSON.stringify(req.body));

    console.log(req.headers)
    console.log(signData(SECRET, JSON.stringify(req.body)))

    if (verified) {
        const branchName = req.body.ref.split("/")[req.body.ref.split("/").length - 1];

        if (branchName === "master" && req.body.repository.name === "deployer") {
            console.log("Deploy requested, attemping to run script...")
            childProcess.execFile("./deploy.sh"); //todo error logging
        }
    }
});

app.listen(PORT, () => {
    console.log("Port:", PORT);
});

//https://github.com/Gisonrg/express-github-webhook/blob/master/index.js
function signData(secret, data) {
	return 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');
}