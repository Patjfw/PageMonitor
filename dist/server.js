'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var path = require('path');

var port = process.argv[2] || 3000;
var app = express();

var server = app.listen(port, function () {});

var fetchTracingData = function fetchTracingData(res) {
  var record = require('../trace.json');
  var fs = require("fs");
  var path = require('path');

  var directory = 'dist/snapshots';

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

  var imagesURL = [];

  for (var i = 0; i < snapshots.length; i++) {
    imagesURL.push("../snapshots/" + (snapshots[i]["ts"] - start["ts"]) + ".png");
    fs.writeFile("./" + directory + "/" + (snapshots[i]["ts"] - start["ts"]) + ".png", snapshots[i]["args"]["snapshot"], 'base64', function (err) {});
  }
  console.log('fetch done!');
  res.json({ urls: imagesURL });
};

app.use(express.static('dist'));
app.use(express.static('snapshots'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../dist/index.html'));
});

app.get('/capture', function (req, res) {
  console.log(req.query);
  if (req.query.token === '415411018') {
    var puppeteer = require('puppeteer');

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var browser, page;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return puppeteer.launch();

            case 2:
              browser = _context.sent;
              _context.next = 5;
              return browser.newPage();

            case 5:
              page = _context.sent;
              _context.next = 8;
              return page.setViewport({ width: 1920, height: 1080 });

            case 8:
              _context.next = 10;
              return page.tracing.start({ path: 'trace.json', screenshots: true });

            case 10:
              _context.next = 12;
              return page.goto(req.query.url, { waitUntil: 'networkidle', networkIdleTimeout: 5000 });

            case 12:
              _context.next = 14;
              return page.tracing.stop();

            case 14:
              _context.next = 16;
              return browser.close();

            case 16:
              _context.next = 18;
              return fetchTracingData(res);

            case 18:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }))();
  } else {
    res.json({ msg: "wrong token" });
  }
});