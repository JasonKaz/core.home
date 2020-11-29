const { spawn } = require('child_process');
const path = require('path');

const PATHS = {
    apps: {
        host: path.resolve('apps', 'host'),
    }
};


const startupCommands = [
    `npm run start --prefix ${PATHS.apps.host}/fast_dot_com.api`,
    `sh ./start_node_exporter`,
    `sudo docker-compose up`
];

startupCommands.forEach(dep => {
    const spawned = spawn(dep, { shell: true });
    spawned.stdout.pipe(process.stdout);
    spawned.stderr.pipe(process.stderr);
});
