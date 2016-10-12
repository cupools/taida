'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (total, display) {
  if (!display) {
    return {
      tick: function tick() {}
    };
  }

  var bar = new _progress2.default('  Compression [:bar] :percent', {
    incomplete: ' ',
    width: 20,
    total: total
  });

  // show the process bar immediately
  bar.tick(0);

  return bar;
};

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }