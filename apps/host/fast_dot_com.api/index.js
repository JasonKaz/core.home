const Koa = require('koa');
const FastSpeedtest = require("fast-speedtest-api");
var Router = require('koa-router');
const client = require('prom-client');

const log = {
    log: (level, { message, ...other }) => console.log(`${new Date().toISOString()} ${level.toUpperCase()}: ${message}${Object.keys(other).length > 0 ? '; ' + JSON.stringify(other) : ''}`),
    info: (data) => log.log('info', data),
    error: data => log.log('error', data),
};

const ONE_MINUTE = 1000 * 60;
const POLL_RATE = ONE_MINUTE * 15;

const Registry = client.Registry;
const register = new Registry();
const gauge = new client.Gauge({
    name: 'download_speed_in_bytes',
    help: 'The download speed as reported by Fast.com, in bytes.',
})
register.registerMetric(gauge);

const poll = async () => {
    try {
        const speed = await speedtest.getSpeed();
        gauge.set(speed);
        log.info({ message: 'Collection succeeded', speed });
    } catch (error) {
        log.error({ message: 'Collection failed', message: error.message });
    }
};

const app = new Koa();
var router = new Router();

let speedtest = new FastSpeedtest({
    token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
    verbose: false,
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: FastSpeedtest.UNITS.Mbps,
});

router.get('/metrics', async (ctx) => (ctx.body = register.metrics()));

poll();
setInterval(() => { poll() }, POLL_RATE);

app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3456);