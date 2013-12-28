var config = require('../config'),
  redis = require('redis'),
  redisClient = null;

function init() {
  redisClient = redis.createClient(config.redis.port, config.redis.host);
  redisClient.auth(config.redis.password);
};

init();

redisClient.on('error', function() {
  console.log('redis err:', arguments);
  init();
});

module.exports = redisClient;