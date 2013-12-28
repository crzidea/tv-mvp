var redisClient = require('../lib/redis'),
  config = require('../config'),
  keyPrefix = config.keyPrefix;

/**
 * GET: /awards(/:id)
 */
exports.list = function(req, res) {
  var exp = req.params.type ?
    keyPrefix + req.params.type + ':*' :
    keyPrefix + '*';
  console.log('award list:', exp);

  redisClient.keys(
    exp,
    function(err, replies) {
      if (err) return;
      if (replies.length) {
        var got = 0;
        var persons = [];
        replies.forEach(function(key) {
          redisClient.hgetall(key, function(err, reply) {
            try {
              reply.details = JSON.parse(reply.details);
            } catch (e) {
              console.log(key);
            }
            persons.push(reply);
            ++got == replies.length && res.json(persons);
          })
        })
      } else {
        res.json([])
      }
    }
  )
}