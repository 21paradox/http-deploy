
var Koa = require('koa');
var Router = require('koa-router');
var bodyParser = require('koa-bodyparser');

const multer = require('koa-multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });
const _ = require('lodash')


var app = new Koa();
var router = new Router();

router.get('/', (ctx, next) => {
    // ctx.router available
});
const allService = {};

router.post('/script', upload.fields([
    { name: 'content', maxCount: 1 }
]), async (ctx) => {
    console.log(ctx.req.body)
    // console.log(ctx.req.files)
    const shellScript = ctx.req.files.content[0].buffer.toString();
    const { hostname, serviceName, version } = ctx.req.body;

    allService[hostname] = {
        ...allService[hostname],
        [serviceName]: {
            version,
            script: shellScript
        }
    };

    ctx.body = {
        code: 0,
        data: {

        }
    };

})



router.post('/pollVersion', (ctx) => {
    const info = ctx.request.body;
    const agentInfo = {};
    Object.entries(info.service).forEach(([key, val]) => {
        agentInfo[key] = {
            serviceName: key,
            version: val.version,
        }
    });

    const newInfo = {};
    Object.entries(allService[info.hostname] || {}).forEach(([key, val]) => {
        newInfo[key] = {
            serviceName: key,
            version: val.version,
        }
    });

    if (!allService[info.hostname]) {
        allService[info.hostname] = info.service;
    }


    if (JSON.stringify(newInfo) !== JSON.stringify(agentInfo)) {
        ctx.body = {
           code: 0,
           data: allService[info.hostname]
        }
    } else {
        ctx.body = {
            code: 0,
            data: { }
        }
    }
});

router.get('/allService', (ctx) => {
    ctx.body = {
        code: 0,
        data: {
            allService
        }
    }
});


router.post('/updateLog', async (ctx) => {
     const {
        serviceName, hostname, log
    } = ctx.request.body
    _.set(allService, [hostname, serviceName, 'log'], log);

    ctx.body = {
        code: 0,
    }
});


app
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())


app.listen(process.env.PORT || 9999, '0.0.0.0')

