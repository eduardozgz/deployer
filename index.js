#!/usr/bin/env node

const { deploys, port } = require("./deploys.json");
const express = require("express");
const bodyParser = require("body-parser");
const runTasks = require("./runTasks");
const signData = require("./signData");

const app = express();

app.use(bodyParser.json());

runTasks(deploys[0].deploy_tasks);

app.post("/deploy", (req, res) => {
    console.log(`Webhook received.`);
    for (deploy of deploys) {
        const {
            repository_full_name,
            branch_to_deploy,
            secret,
            deploy_tasks
        } = deploy;
        const repositoryNameMatches = repository_full_name === req.body.repository.full_name;
        const hasValidSignature = req.get("x-hub-signature") === signData(secret, JSON.stringify(req.body));
        const branchPushedIsDeployable = branch_to_deploy === req.body.ref.split("/")[req.body.ref.split("/").length - 1];
        if (repositoryNameMatches && hasValidSignature && branchPushedIsDeployable) {
            console.log(`Webhook authorized ✔`);
            console.log(`Running deploy tasks...`);
            runTasks(deploy_tasks);
        }
    }
});

app.listen(port, () => {
    console.log("HTTP SERVER LISTENING @", port);
});