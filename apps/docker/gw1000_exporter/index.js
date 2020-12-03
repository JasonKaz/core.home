const Koa = require('koa');
var Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const client = require('prom-client');

const register = new (client.Registry);
const registeredMetrics = new Map();

const app = new Koa();
app.use(bodyParser({ enableTypes: ['form'] }));

var router = new Router();
const KEYS_TO_DELETE = new Set(['PASSKEY', 'stationtype', 'dateutc', 'model']);
const PREFIX = 'gw1000';

// /**
//  * Sets a value to a metric. Will register the metric if it hasn't been set yet.
//  * @param {string} metricName 
//  * @param {number} value 
//  */
const setMetricValue = (metricName, value) => {
  if (!registeredMetrics.has(metricName)) {
    const gauge = new client.Gauge({
      name: `${PREFIX}_${metricName}`,
      help: metricName,
    });

    register.registerMetric(gauge);
    registeredMetrics.set(metricName, gauge);
  }

  registeredMetrics.get(metricName).set(value);
};

const parseDataPoint = (data) => {
  const parsed = parseFloat(data);
  return isNaN(parsed) ? data : parsed;
};

const parsePayload = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, parseDataPoint(value)]));

router.post('/', async (ctx) => {
  const uw1000Data = ctx.request.body;

  KEYS_TO_DELETE.forEach(key => { delete uw1000Data[key] });

  Object.entries(parsePayload(uw1000Data)).forEach(([key, value]) => { setMetricValue(key, value) });
});

router.get('/metrics', async (ctx) => (ctx.body = register.metrics()));

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(7689);