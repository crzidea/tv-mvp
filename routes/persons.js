var redisClient = require('../lib/redis'),
    config = require('../config'),
    keyPrefix = config.keyPrefix,
    idKey = config.idKey,
    deadline = new Date(config.deadline);
/**
 * POST /persons/:id/votes
 */
exports.votes = function(req, res) {
    if (deadline < Date.now()) {
        res.json({
            votes: -2
        })
        return
    }
    var remoteAddr = req.headers['x-real-ip'];
    redisClient.get('ip:' + remoteAddr, function(err, reply) {
        if (remoteAddr && (reply || !req.session.voteAccess || req.session.voted)) {
            res.json({
                votes: -1
            });
            return
        }
        redisClient.keys(keyPrefix + '*:' + req.params.id, function(err, reply) {
            console.log(reply[0]);
            if (reply.length != 1) {
                res.json({
                    votes: -1
                });
                return
            }
            redisClient.hincrby(
                reply[0], 'votes', 1,
                function(err, reply) {
                    if (err) return
                    res.json({
                        votes: reply
                    });
                }
            )
            console.log(remoteAddr, req.params.id, Date.now());
            req.session.voted = true;
            redisClient.setex('ip:' + remoteAddr, config.sessionTtl, Date.now());
        })
    })
};
/**
 * POST /persons
 */
exports.add = function(req, res) {
    redisClient.incr(idKey, function(err, id) {
        req.body.id = id;
        req.body.votes = 0;
        req.body.details = JSON.stringify(req.body.details);
        redisClient.hmset(
            keyPrefix + req.body.award + ':' + id,
            req.body,
            function(err, reply) {
                if (err) return;
                res.json({
                    id: id
                })
            }
        )
    })
};
/**
 * DELETE /persons/:id
 */
exports.del = function(req, res) {
    redisClient.del(keyPrefix + req.params.id, function(err, reply) {
        if (err) return;
        res.json(reply);
    })
};