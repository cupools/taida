'use strict';

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _emitter = require('./emitter');

var _emitter2 = _interopRequireDefault(_emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bar = null;

_emitter2.default.on('bar.init', function (total) {
  bar = new _progress2.default('  Compression [:bar] :percent', {
    incomplete: ' ',
    width: 20,
    total: total
  });

  bar.tick(0);
});

_emitter2.default.on('bar.progress', function () {
  if (!bar) return;
  bar.tick();
});