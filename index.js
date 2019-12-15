#!/usr/bin/env node

const { deploys, port } = require("./deploys.json");
const express = require("express");
const bodyParser = require("body-parser");
const signData = require("./signData");
const fs = require("fs");
const childProccess = require("child_process");

if (!fs.existsSync("./scripts")) fs.mkdirSync("./scripts");

const app = express();

app.use(bodyParser.json());

app.post("/", (req, res) => {
    console.log(`Webhook received.`);
    for (deploy of deploys) {
        const {
            repository_full_name,
            branch_to_deploy,
            secret,
            deploy_scripts
        } = deploy;
        const repositoryNameMatches = repository_full_name === req.body.repository.full_name;
        const hasValidSignature = req.get("x-hub-signature") === signData(secret, JSON.stringify(req.body));
        const branchPushedIsDeployable = branch_to_deploy === req.body.ref.split("/")[req.body.ref.split("/").length - 1];
        if (repositoryNameMatches && hasValidSignature && branchPushedIsDeployable) {
            console.log(`Webhook authorized ✔`);
            console.log(`Running deploy scripts...`);
            for (script of deploy_scripts) {
                childProccess.execFileSync(script);
            }
        }
    }
});

app.listen(port, () => {
    console.log("HTTP SERVER LISTENING @", port);
});
