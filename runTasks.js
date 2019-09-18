const childProcess = require("child_process");
const path = require('path');

const runTask = (task, options) => {
    return new Promise(resolve => {
        childProcess.exec(task, options, (err, stdout, stderr) => {
            console.log(err, stdout, stderr);
        }).on("close", resolve);
    });
};

const runTasks = deployTasks => {
    let [failed, succeed] = [0,0];
    let cwd = process.cwd();
    console.log(cwd)
    deployTasks.forEach(async (task, i, roDeployTasks) => {
        if (task.split(" ")[0] === "cd") {
            cwd = task.slice(3);
            ++succeed;
            console.log(`[${i+1}/${roDeployTasks.length}] ✔ Task "${task}" done.`);
        } else {
            let exitCode;
            try {
                exitCode = await runTask(task, { cwd });
            } catch (err) {
                console.error(err);
            }
            if (exitCode === 0) {
                ++succeed;
                console.log(`[${i+1}/${roDeployTasks.length}] ✔ Task "${task}" done with exit code ${exitCode}.`);
            } else {
                ++failed;
                throw `[${i+1}/${roDeployTasks.length}] ❌ Task "${task}" failed with exit code ${exitCode}. Stoping...`;
            }

        }
    });
    console.log(`Tasks ended. ${failed} failed, ${succeed} succeed of ${deployTasks.length} tasks.`);
};

module.exports = runTasks;