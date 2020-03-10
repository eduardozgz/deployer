const isSignatureValid = require('./isSignatureValid');
const childProccess = require('child_process');
const { projects } = require('./config.json');

// TODO add webhook test support

module.exports = (req, res) => {
  if (req.headers['content-type'] === 'application/json') {
    let rawBody = '';

    req.on('data', (data) => {
      rawBody += data;
    });

    req.on('end', async () => {
      let body = '';
      try {
        body = JSON.parse(rawBody);
      } catch (e) {
        console.log(e);
        res.statusCode = 400;
        res.end();
      }
      for (const project of projects) {
        const { repository, branchToDeploy, secret, tasks } = project;
        const signature = req.headers['x-hub-signature'];

        if (repository === body.repository.full_name) {
          if (secret && !isSignatureValid(signature, secret, JSON.stringify(body))) {
            console.log(`[${repository}] Webhook NOT authorized ❌`);
            res.statusCode = 401;
            res.end();
            return;
          }
          
          console.log(`[${repository}] Webhook authorized ✔`);

          switch (req.headers['x-github-event']) {
            case 'ping': {
              console.log(`[${repository}#${branchToDeploy}] Ping received 🏓`);
              break;
            }

            case 'push': {              
              const payloadBranch = body.ref.split('/')[body.ref.split('/').length - 1];
              if (payloadBranch === branchToDeploy) {
                console.log(`[${repository}#${branchToDeploy}] Push event received, running tasks...`);
                for (const task of tasks) {
                  childProccess.execFileSync(task);
                }
              }
              break;
            }
          }
        }
      }

      res.statusCode = 204;
      res.end();
    });
  } else {
    res.statusCode = 415;
    res.end();
  }
};
