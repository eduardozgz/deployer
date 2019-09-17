require("dotenv").config();
const { PORT, SECRET } = process.env;
const crypto = require('crypto');
const express = require("express");
const bodyParser = require('body-parser');
const GithubWebHook = require('express-github-webhook');
const app = express();
let webhookHandler = GithubWebHook({ path: '/deploy', secret: SECRET });

app.use(bodyParser.json());
app.use(webhookHandler);

webhookHandler.on('push', (repo, data) => {
    console.log(repo);


});

app.listen(PORT, () => { console.log("Port:", PORT) });
