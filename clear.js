var config = require('./config'),
	redisClient = require('redis').createClient(config.redis.port, config.redis.host);
redisClient.auth(config.redis.password);
redisClient.keys(
	config.keyPrefix + '*',
	function(err, replies) {
		if (err) return;
		replies.forEach(function(key) {
			redisClient.hset(key, 'votes', 0, function(argument) {
				console.log('set votes of ', key, '0');
			})
		})
	}
)