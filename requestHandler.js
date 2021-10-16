const isSignatureValid = require("./isSignatureValid");
const childProcess = require("child_process");
const util = require("util");
const { projects } = require("./config.json");

module.exports = (req, res) => {
  if (req.headers["content-type"] === "application/json") {
    let rawBody = "";

    req.on("data", (data) => {
      rawBody += data;
    });

    req.on("end", async () => {
      let body = null;
      try {
        body = JSON.parse(rawBody);
        res.statusCode = 204;
        res.end();
      } catch (e) {
        res.statusCode = 400;
        res.end();
        return;
      }

      for (const project of projects) {
        const { repository, branchToDeploy, secret, tasks } = project;
        const signature = req.headers["x-hub-signature"];
        const delivery = req.headers["x-github-delivery"];

        function log(text) {
          console.log(
            `[${repository}#${branchToDeploy}] (${delivery}) ${text}`
          );
        }

        if (repository === body.repository.full_name) {
          if (
            secret &&
            !isSignatureValid(signature, secret, JSON.stringify(body))
          ) {
            log(`Webhook NOT authorized ❌`);
            res.statusCode = 401;
            res.end();
            return;
          }

          log(`Webhook authorized ✔`);

          switch (req.headers["x-github-event"]) {
            case "ping": {
              log(`Ping received 🏓`);
              break;
            }

            case "push": {
              const payloadBranch =
                body.ref.split("/")[body.ref.split("/").length - 1];
              if (payloadBranch === branchToDeploy) {
                log(`Push event received, running tasks...`);

                try {
                  for (let i = 0; i < tasks.length; i++) {
                    const task = tasks[i];

                    const taskProcess = childProcess.execFile(task);

                    taskProcess.stdout.on("data", (data) =>
                      log(`Task #${i} stdout: ${data}`)
                    );
                    taskProcess.stderr.on("data", (data) =>
                      log(`Task #${i} stderr: ${data}`)
                    );

                    await new Promise((resolve, reject) => {
                      taskProcess
                        .on("exit", (code) =>
                          code === 0 ? resolve() : reject({ code, task: i })
                        )
                        .on("error", (error) => reject({ error, task: i }));
                    });
                  }

                  log("All tasks have been run successfully");
                } catch (error) {
                  if ("code" in error) {
                    log(
                      `Something went wrong while running the task #${error.task}: exited with code ${error.code}`
                    );
                  } else if ("error" in error) {
                    log(
                      `Something went wrong while running the task #${error.task}: ${error.error}`
                    );
                  } else {
                    log(
                      `Something went wrong while running an unknown task: ${error}`
                    );
                  }
                }
              }
              break;
            }
          }
        }
      }
    });
  } else {
    res.statusCode = 415;
    res.end();
  }
};
