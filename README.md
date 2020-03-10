# deployer
A simple deployment server that works with github webhooks

## Installation
### 1. config.json
Copy config.json.example to config.json and fill out the fields.

`SECURE_SERVER`: Set it to `true` if do you wish to listen for webhook over HTTPS (not necessary if deployer is already behind a reverse proxy with HTTPS)
`PRIVATE_KEY`: Required if `SECURE_SERVER` is `true`, the path to the private key
`CERT`: Required if `SECURE_SERVER` is `true`, the path to the cert
`PORT`: The desired port that will be used to listen for webhooks
`project`: An array of project objects

#### Project object
```json
{
      "repository": "user-or-org/repo-name",
      "branchToDeploy": "master",
      "secret": "superscretsecret",
      "tasks": [
        "/path/to/script.sh"
      ]
    }
```
`repository`: If we were to deploy this project, the value would be `eduardozgz/deployer`
`branchToDeploy`: The desired branch to be deployed, this is usually `master`
`secret`: This is like a password, choose something strong and never share it
`tasks`: An array of strings, as value, the path to the installation scripts for your project, a script would look like this:
```sh
#!/bin/bash
cd /path/to/your/project
npm install && systemctl restart your-app.service
```

### 2. Receiving webhooks
Go to your repository settings on github, go to webhooks and add one

As payload URL, add the host where deployer is running (remember to open the firewall if it's necessary)

Change the content type to `application/json`

Enter the secret that you used in the config.json

And add the webhook

### 3. Start it!
Run `node .`
