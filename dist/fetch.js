'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var record = require('../trace.json');
var fs = require("fs");
var path = require('path');

var directory = 'snapshots';

fs.readdir(directory, function (err, files) {
  if (err) throw err;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(files), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var file = _step.value;

      fs.unlink(path.join(directory, file), function (err) {
        if (err) throw err;
      });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
});

var start = record["traceEvents"][0];
var snapshots = record["traceEvents"].filter(function (item) {
  return item.cat === "disabled-by-default-devtools.screenshot";
});

for (var i = 0; i < snapshots.length; i++) {
  fs.writeFile("./" + directory + "/" + (snapshots[i]["ts"] - start["ts"]) + ".png", snapshots[i]["args"]["snapshot"], 'base64', function (err) {});
}