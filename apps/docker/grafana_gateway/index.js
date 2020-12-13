const Koa = require('koa');
var Router = require('koa-router');

const app = new Koa();
const router = new Router();
const axios = require('axios').default;

router.get('/query', async (ctx) => {
    await doQuery(ctx, ctx.request.query.query);
});

router.get('/prom-job', async (ctx) => {
    await doQuery(ctx, `{job="${ctx.request.query.job}"}`);
});

const doQuery = async (ctx, query) => {
    try {
        const response = await fetchData(query)
        const data = parseData(response.data);

        ctx.body = data;
        ctx.status = 200;
    } catch (e) {
        ctx.status = 500;
        ctx.body = 'Bad query: ' + e;
    };
};

const fetchData = async (query) => {
    return axios.get(`http://192.168.0.180:3000/api/datasources/proxy/1/api/v1/query?query=${query}&time=1607244791`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer eyJrIjoiN0ZqbGhoRUE2UklOOUFDVE1wUkN5UDVIS1pMejVvTEIiLCJuIjoiaGFzcy1pbXBvcnRlciIsImlkIjoxfQ==`
        }
    });
};

const parseData = (response) => {
    if (response.status !== 'success') {
        console.error('Unknown status', response.status);
        return null;
    }

    // Not sure what other types there are yet so just prepping
    switch (response.data.resultType) {
        case 'vector':
            return response.data.result[0].value[1];

        default:
            console.error('Unknown result type');
            return null;
    }
};


app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(4545, undefined, (err) => {
        if (err) {
            console.error('Server error', err);
            throw err;
        }
        console.log("The server has started")
    });