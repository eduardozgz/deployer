const isSignatureValid = require('./isSignatureValid');
const childProccess = require('child_process');

// TODO add webhook test support

module.exports = (req, res) => {
  if (req.headers['content-type'] === 'application/json') {
    let rawBody = '';

    req.on('data', (data) => {
      rawBody += data;
    });

    req.on('end', async () => {
      const body = JSON.parse(rawBody);
      for (const project of projects) {
        const { repository, branchToDeploy, secret, tasks } = project;
        const signature = req.headers['x-hub-signature'];
        const receivedBranchName = body.ref.split('/')[body.ref.split('/').length - 1];

        if (repository === body.repository.full_name && branchToDeploy === receivedBranchName) {
          if (signature && !isSignatureValid(signature, secret, body)) {
            res.statusCode = 401;
            res.end();
            return;
          }
          
          console.log(`[${repository}#${branchToDeploy}] Webhook authorized ✔`);

          switch (req.headers['x-github-event']) {
            case 'ping': {
              console.log(`[${repository}#${branchToDeploy}] Ping received 🏓`);
              break;
            }

            case 'push': {
                console.log(`[${repository}#${branchToDeploy}] Push event received, running tasks...`);
                for (const task of tasks) {
                  childProccess.execFileSync(task);
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
