#!/usr/bin/env node

const {
    deploys,
    port
} = require("./deploys.json");
const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const childProcess = require("child_process");

const app = express();

app.use(bodyParser.json());

app.post("/deploy", (req, res) => {
    const requestId = new Date().getSeconds();
    console.log(`[${requestId}] `);
    console.log(`[${requestId}] Webhook received.`);
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
            console.log(`[${requestId}] Webhook authorized ✔`);
            console.log(`[${requestId}] Running deploy tasks...`);
            runTasks(deploy_tasks);
        }
    }
});

app.listen(port, () => {
    console.log("HTTP SERVER LISTENING @", port);
});

const runTask = (...args) => {
    return new Promise(resolve => {
        childProcess.exec(args).on("exit", resolve);
    });
};

const runTasks = deployTasks => {
    let [failed, succeed] = [0,0];
    let cwd = __dirname;
    try {
        deployTasks.forEach(async (task, i, roDeployTasks) => {
            if (task.split(" ")[0] === "cd") {
                cwd = task.slice(3);
                console.log(`[${requestId}] [${i+1}/${roDeployTasks.length}] ✔ Task "${task}" done.`);
            } else {
                const exitCode = await runTask(task, { cwd });
                if (exitCode > 0) {
                    ++failed;
                    throw `[${requestId}] [${i+1}/${roDeployTasks.length}] ❌ Task "${task}" failed with exit code ${exitCode}. Stoping...`;
                } else {
                    ++succeed;
                    console.log(`[${requestId}] [${i+1}/${roDeployTasks.length}] ✔ Task "${task}" done with exit code ${exitCode}.`);
                }

            }
        });
    } catch (err) {
        console.error(err);
    }
    console.log(`[${requestId}] Tasks ended. ${failed} failed, ${succeed} succeed of ${deployTasks.length} tasks.`);
};

//https://github.com/Gisonrg/express-github-webhook/blob/master/index.js
const signData = (secret, data) => {
    return (
        "sha1=" +
        crypto
        .createHmac("sha1", secret)
        .update(data)
        .digest("hex")
    );
};