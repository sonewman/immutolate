/**
 * @exports
 */
module.exports = exports = fromJS;
exports.Isolate = Isolate;
exports.ArrayIsolate = ArrayIsolate;

var Immutable = require('immutable');
var isList = Immutable.List.isList;
var Iterable = Immutable.Iterable;
var isIterable = Iterable.isIterable;

var utils = require('./utils');
var Update = utils.Update;
var Construct = utils.Construct;
var handlePath = utils.handlePath;

function fromJS(value, root, path) {
  var proto = Array.isArray(value) || isList(value)
    ? ArrayIsolateProto
    : IsolateProto;
  
  return Construct(proto, value, root, path);
}

/**
 * @class Listener
 * @private
 */
function Listener(keyPath) {
  this.keyPath = keyPath;
  this.handlers = [];
}

var ArrayIsolateProto = Object.create(Isolate.prototype);
/**
 * @class ArrayIsolate
 */
function ArrayIsolate(value, root, path) {
  return Construct(ArrayIsolateProto, value, root, path);
}
ArrayIsolate.prototype = ArrayIsolateProto;

ArrayIsolate.isArrayIsolate = function (o) {
  return o instanceof ArrayIsolate;
};
ArrayIsolateProto.constructor = ArrayIsolate;

ArrayIsolateProto.toString = function () {
  return 'ArrayIsolate [' + isolateToString(this) + ' ]';
};

ArrayIsolateProto.push = function (/* values */) {
  
};

function pop_(old) {
  return old.pop();
}

ArrayIsolateProto.pop = function () {
  return Update(this, 'updateIn', [pop_]);
};

ArrayIsolateProto.unshift = function (/* values */) {
  
};

ArrayIsolateProto.shift = function () {
  
};

var IsolateProto = Object.create(null);

/**
 * @class Isolate
 */
function Isolate(value, root, path) {
  return Construct(IsolateProto, value, root, path);
}

Isolate.isIsolate = isIsolate;
function isIsolate(o) { return o instanceof Isolate; }

var IsolateProto = Isolate.prototype;
IsolateProto.constructor = Isolate;
IsolateProto._listeners = null;
IsolateProto._value = null;
IsolateProto.Orchestrator = null;

IsolateProto.toString = function () {
  return 'Isolate {' + isolateToString(this) + ' }';
};

/**
 * @method Isolate#equals(<value>)
 * @returns {boolean}
 */
IsolateProto.equals = function equals(that) {
  if (this === that) return true;

  var value = this._root.value.getIn(this._keyPath);
  return value === that || (!!value.equals && value.equals(that));
};

/**
 * @method Isolate#get(<string>)
 */
IsolateProto.get = function get(key, notSetValue) {
  return this.getIn((key == null ? [] : [key]), notSetValue);
};

/**
 * @method Isolate#getIn(<Array>)
 */
IsolateProto.getIn = getIn;
function getIn(path, notSetValue) {
  if (!Array.isArray(path))
    throw new Error('path must be an array');

  if (path.length === 0) return this;

  path = this._keyPath.concat(path);
  
  var root = this._root;
  var rootValue = root._value;
  var value = isIterable(rootValue) 
    ? rootValue.getIn(path, notSetValue)
    : rootValue;

  return fromJS(value, root, path);
}

/**
 * @private
 */
function isFunc(obj) { return 'function' === typeof obj; }

IsolateProto.update
= IsolateProto.set
= function update() {
  var path = [arguments[0]];

  if (arguments.length === 2)
    return this.updateIn(path, arguments[1]);
  if (arguments.length > 2) 
    return this.updateIn(path, arguments[1], arguments[2]);
};

IsolateProto.updateIn
= IsolateProto.setIn
= function udpateIn() {
  return Update(this, 'updateIn', arguments);
};

//function createMerge()

['merge', 'mergeWith', 'mergeIn', 'mergeDeep', 'mergeDeepWith', 'mergeDeepIn']
.forEach(function (method) {
  IsolateProto[method] = function mergeMethod() {
    var args = arguments;
    return Update(this, 'updateIn', [function () {
      
    }]);
  };
});

/**
 * @method Isolate#withMutations(<Function>)
 */
IsolateProto.withMutations = function withMutations(cb) {
  return isFunc(cb) ? Update(this, 'withMutations', [cb]) : this;
};

/**
 * @method Isolate#addListener(<Function>)
 */
IsolateProto.addListener
= function addListener(cb) {
  if (!this._listener) {
    this._listener = new Listener(this._keyPath);
    this._root._listeners.push(this._listener);
  }

  this._listener.handlers.push(cb);
  return this;
};

/**
 * @method Isolate#removeListener(<Function>)
 */
IsolateProto.removeListener 
= function removeListener(cb) {
  var listener = this._listener;

  if (listener) {
    var handlers = listener.handlers;
    var i = handlers.indexOf(cb);
    handlers.splice(i, 1);

    if (handlers.length === 0) {
      var rootListeners = this._root._listeners;
      i = rootListeners.indexOf(listener);
      rootListeners.splice(i, 0);
      this._listener = null;
    }
  }
  return this;
};

/**
 * @method Isolate#deref()
 * @method Isolate#valueOf()
 */
IsolateProto.toJS
= IsolateProto.valueOf
= IsolateProto.deref
= function deref(notSetValue) {
  var value = this._root._value.getIn(this._keyPath, notSetValue);
  return (value && value.toJS) ? value.toJS() : value;
};

/**
 * @private
 */
function wrap_(root, path, value) {
  return isIterable(value) ? Isolate(value, root, path) : value;
}

/**
 * @method Isolate#__iterate(<Function>, <boolean>)
 */
IsolateProto.__iterate
= function iterate_(cb, reverse) {
  var self = this;
  var deref = self.deref();

  if (!deref || !deref.__iterate) return 0;

  function onIt(v, k) {
    return cb(wrap_(self._root, [k], v), k, self);
  }
  return deref.__iterate(onIt, reverse);
};

/**
 * @method Isolator#__iterator(<Function>, <boolean>)
 * @returns {Immutable.Iterator}
 */
IsolateProto.__iterator
= function iterator_(type, reverse) {
  var deref = this.deref();
  var iterator = deref
    && deref.__iterator
    && deref.__iterator(Iterator.ENTRIES, reverse);

  return new Iterator(createItCallback(this, iterator));
};

/**
 * @private
 * @description Create Iteration Callback
 * @returns {Function}
 */
function createItCallback(isolate, iterator) {
  return function iteratorCallback() {
    if (!iterator) return { value: undefined, done: true };

    var step = iterator.next();
    if (step.done) return step;

    var entry = step.value;
    var key = entry[0];
    var v = wrap_(isolate, [key], entry[1]);
    var value;

    if (type === Iterator.KEYS) {
      value = key;
    } else if (type === Iterator.VALUES) {
      value = v;
    } else {
      value = [key, v];
    }

    return { value: value, done: false };
  };
}

/**
 * @private
 */
function isolateToString(iso) {
  var value = iso._value || iso._root.getIn(iso._keyPath);
  if (value === undefined) value = 'undefined';
  else if (value === null) value = 'null';
  return value !== '' ? ' ' + value.toString() : '';
}
