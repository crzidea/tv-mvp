var redisClient = require('../lib/redis'),
  config = require('../config'),
  keyPrefix = config.keyPrefix;

/**
 * GET: /share
 */
exports.persons = function(req, res) {
  var share = [];
  redisClient.keys(
    keyPrefix + req.params.id + ':*',
    function(err, replies) {
      if (err) return;
      var got = 0;
      replies.forEach(function(key) {
        redisClient.hgetall(key, function(err, reply) {
          try {
            reply.subjects = JSON.parse(reply.subjects);
          } catch (e) {
            console.log(key);
          }
          share.push(reply);
          ++got == replies.length && res.json(share);
        })
      })
    }
  )
};