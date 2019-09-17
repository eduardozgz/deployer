require("dotenv").config();
const { PORT, SECRET } = process.env;
const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post("/deploy", (req, res) => {
    console.log(req.headers['X-Hub-Signature'])
    

});

app.listen(PORT, () => { console.log("Port:", PORT) });
