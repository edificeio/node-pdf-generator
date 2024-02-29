const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    // create 1 process per cpu
    os.cpus().forEach(() => {
        cluster.fork();
    });
    // restart if process has been killed
    cluster.on('exit', (worker) => {
        console.log(`Process hash been killed ${worker.process.pid} restarting...`);
        cluster.fork();
    });
} else {
    // call main code
    require("./app")
}