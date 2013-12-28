/*
 * GET home page.
 */
exports.index = function(req, res) {
  if (req.headers['x-real-ip']) {
    console.log(req.headers['x-real-ip'], req.headers['x-forwarded-for']);
    req.session.voteAccess = true;
  }
  res.sendfile('views/index.html');
};

exports.awards = require('./awards');
exports.persons = require('./persons');