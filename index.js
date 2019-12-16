#!/usr/bin/env node

const { deploys, port } = require("./deploys.json");
const http = require("http");
const signData = require("./signData");
const fs = require("fs");
const childProccess = require("child_process");

if (!fs.existsSync("./scripts")) fs.mkdirSync("./scripts");

const parseJson = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

http
    .createServer((req, res) => {
        if (req.headers["content-type"] === "application/json") {
            let body = "";
            req.on("data", data => body += data);
            req.on("end", async () => {
                body = parseJson(body);
                if (body) {
                    console.log(`Webhook received.`);
                    for (deploy of deploys) {
                        const {
                            repository_full_name,
                            branch_to_deploy,
                            secret,
                            deploy_scripts
                        } = deploy;
    
                        const repositoryNameMatches = repository_full_name === body.repository.full_name;
                        const hasValidSignature = req.headers["x-hub-signature"] === signData(secret, JSON.stringify(body));
                        const branchPushedIsDeployable = branch_to_deploy === body.ref.split("/")[body.ref.split("/").length - 1];
                        
                        if (repositoryNameMatches && hasValidSignature && branchPushedIsDeployable) {
                            console.log(`Webhook authorized ✔`);
                            console.log(`Running deploy scripts...`);
                            for (script of deploy_scripts) {
                                childProccess.execFileSync(script);
                            }
                        }
                    }
                    res.statusCode = 204;
                    res.end();
                } else {
                    res.statusCode = 400;
                    res.end();
                }
            });
        } else {
            res.statusCode = 415;
            res.end();
        }
    })
    .listen(port, () => {
    console.log("HTTP SERVER LISTENING @", port);
});
