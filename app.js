/**
 * Module dependencies.
 */
var express = require('express'),
    RedisStore = require('connect-redis')(express)
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    config = require('./config'),
    cluster = require('cluster'),
    numCPUs = 2;

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {

    var app = express()


    // all environments
    app.set('port', process.env.PORT || config.port);
    app.use(express.favicon());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        store: new RedisStore({
            host: config.redis.host,
            port: config.redis.port,
            pass: config.redis.password,
            ttl: config.sessionTtl
        }),
        secret: config.sessionSecret
    }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'views')));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    app.get('/', routes.index);

    app.get('/awards', routes.awards.list);
    app.get('/awards/:type', routes.awards.list);
    app.get('/persons', routes.awards.list);
    app.post('/persons', routes.persons.add);
    app.post('/persons/:id/votes', routes.persons.votes);
    app.delete('/persons/:id', routes.persons.del);

    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });

}