var redisClient = require('../lib/redis'),
    config = require('../config'),
    keyPrefix = config.keyPrefix,
    idKey = config.idKey,
    deadline = new Date(config.deadline);
/**
 * POST /share/:id/votes
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
        if (reply || !req.session.voteAccess || req.session.voted) {
            res.json({
                votes: -1
            });
        } else {
            redisClient.hincrby(
                keyPrefix + req.params.id, 'votes', 1,
                function(err, reply) {
                    if (err) return
                    req.session.voted = true;
                    res.json({
                        votes: reply
                    });
                }
            )
            console.log(remoteAddr, req.params.id, Date.now());
            redisClient.setex('ip:' + remoteAddr, config.sessionTtl, Date.now());
        }
    })
};
/**
 * POST /share
 */
exports.add = function(req, res) {
    redisClient.incr(idKey, function(err, id) {
        req.body.id = id;
        req.body.votes = 0;
        req.body.subjects = JSON.stringify(req.body.subjects);
        redisClient.hmset(keyPrefix + id, req.body, function(err, reply) {
            if (err) return;
            res.json({
                id: id
            })
        })
    })
};
/**
 * DELETE /share/:id
 */
exports.del = function(req, res) {
    redisClient.del(keyPrefix + req.params.id, function(err, reply) {
        if (err) return;
        res.json(reply);
    })
};