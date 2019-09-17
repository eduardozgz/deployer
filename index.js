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

    const { body } = req;
    const unparsedBody = JSON.stringify(req.body);
    
    const verified = verifySignature(SECRET, unparsedBody, req.headers['X-Hub-Signature']);

    if (verified) {
        const branchName = body.ref.split("/")[body.ref.split("/").length - 1];
        if (branchName === "master" && body.repository.name === "deployer") {
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

function verifySignature(secret, data, signature) {
	return bufferEq(new Buffer(signature), new Buffer(signData(secret, data)));
}