var index = require('./lib/index').default
index.compress = require('./lib/taida').default
index.apikey = require('./lib/apikey').default
index.log = require('./lib/utils/log').default

module.exports = index
