(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
      if (!arr || typeof arr.length === 'undefined') throw new TypeError('Promise.all accepts an array');
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GameMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fetch = require('./fetch.js');

var _promisePolyfill = require('promise-polyfill');

var _promisePolyfill2 = _interopRequireDefault(_promisePolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameMap = exports.GameMap = function () {
	function GameMap(jsonPath, ctx) {
		var _this = this;

		_classCallCheck(this, GameMap);

		this.tiles = {};
		this.tilesets = [];
		this.ctx = ctx;
		this.mapa = (0, _fetch.get)(jsonPath).then(function (m) {
			_this.w = m.tilewidth;_this.h = m.tileheight;return m;
		});
		this.mapa.then(this.parseTilesets.bind(this));
		this.mapa.then(this.parseLayer.bind(this));
	}

	_createClass(GameMap, [{
		key: 'parseTilesets',
		value: function parseTilesets(mapa) {
			var _this2 = this;

			mapa.tilesets.forEach(function (ts) {
				return _this2.tilesets.push(new Tileset(ts));
			});
		}
	}, {
		key: 'parseLayer',
		value: function parseLayer(mapa) {
			mapa.layers.forEach(this.drawData.bind(this));
		}
	}, {
		key: 'drawData',
		value: function drawData(layer) {
			var _this3 = this;

			var cols = layer.width;
			layer.data.forEach(function (d, i) {
				var tile = _this3.findTile(d);
				if (tile !== null) _this3.drawTile(tile, _this3._getMatrix(i, cols));
			});
		}
	}, {
		key: '_getMatrix',
		value: function _getMatrix(idx, ncols) {
			return {
				x: idx % ncols * this.w,
				y: Math.floor(idx / ncols) * this.h,
				w: this.w,
				h: this.h
			};
		}
	}, {
		key: 'findTile',
		value: function findTile(gid) {
			if (gid === 0) return null;
			return this.tilesets.filter(function (ts) {
				return ts.fgid <= gid && gid < ts.max;
			})[0].findTile(gid);
		}
	}, {
		key: 'drawTile',
		value: function drawTile(tile, coor) {
			var _this4 = this;

			tile.img.then(function (img) {
				_this4.ctx.drawImage(img, tile.x, tile.y, tile.w, tile.h, coor.x, coor.y, coor.w, coor.h);
			});
		}
	}]);

	return GameMap;
}();

var Tileset = function () {
	function Tileset(tileset) {
		_classCallCheck(this, Tileset);

		var self = this;
		this.tiles = {};
		this.fgid = tileset.firstgid;
		this.cols = tileset.columns;
		this.max = tileset.tilecount;
		this.wFactor = tileset.tilewidth;
		this.hFactor = tileset.tileheight;
		this.img = new Image();
		this.img.src = '/assets/tilesets/' + tileset.image.match(/\/([^\/]+)\/?$/)[1];
		this.p = new _promisePolyfill2.default(function (r) {
			return self.img.onload = function () {
				return r(self.img);
			};
		});
	}

	_createClass(Tileset, [{
		key: 'findTile',
		value: function findTile(gid) {
			if (this.tiles[gid] === undefined) {
				var n = gid - this.fgid;
				this.tiles[gid] = {
					x: n % this.cols * this.wFactor,
					y: Math.floor(n / this.cols) * this.hFactor,
					w: this.wFactor,
					h: this.hFactor,
					img: this.p
				};
			}
			return this.tiles[gid];
		}
	}]);

	return Tileset;
}();

},{"./fetch.js":3,"promise-polyfill":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.put = exports.post = exports.get = undefined;

var _promisePolyfill = require('promise-polyfill');

var _promisePolyfill2 = _interopRequireDefault(_promisePolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// To add to window
if (!window.Promise) {
	window.Promise = _promisePolyfill2.default;
}

function fetch(method) {
	return function (url, opts) {
		opts = opts || {};
		var p = new _promisePolyfill2.default(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			opts.headers ? opts.headers.forEach(function (h) {
				xhr.setRequestHeader(h.k, h.v);
			}) : null;
			var send = opts.form ? opts.form.urlEncoded() : null;
			xhr.send(send);

			xhr.onreadystatechange = function () {
				if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					if (send === null) return resolve(JSON.parse(xhr.responseText));
					resolve(opts.form.labels());
				}
			};
		});
		return p;
	};
}

var get = exports.get = fetch('GET');
var post = exports.post = fetch('POST');
var put = exports.put = fetch('PUT');

},{"promise-polyfill":1}],4:[function(require,module,exports){
'use strict';

var _GameMap = require('./GameMap.js');

var canvas = document.createElement('canvas');
canvas.setAttribute('width', '1000px');
canvas.setAttribute('height', '300px');
document.body.appendChild(canvas);

var map = new _GameMap.GameMap('/json/mapa.json', canvas.getContext('2d'));

},{"./GameMap.js":2}]},{},[4]);
