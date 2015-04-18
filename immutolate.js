/**
 * @exports
 */
module.exports = exports = isolateFromJS;
exports.Isolate = Isolate;
exports.ArrayIsolate = ArrayIsolate;

var Immutable = require('immutable');
var ImmutableFromJS = Immutable.fromJS;
var isList = Immutable.List.isList;
var Iterable = Immutable.Iterable;
var isIterable = Iterable.isIterable;

var IsolateState = require('./lib/state');

function isolateFromJS(value, root, path) {
  var proto = Array.isArray(value) || isList(value)
    ? ArrayIsolateProto
    : IsolateProto;

  return Construct(proto, value, root, path);
}

/**
 * @private
 */
var hasNumbers = /\d+/;
function handlePath(path) {
  if (Array.isArray(path)) return path;
  return (path || '').split('.').reduce(function (keyPath, key) {
    key = hasNumbers.test(key) ? parseInt(key) : key;
    if (key || key === 0) keyPath.push(key);
    return keyPath;
  }, []);
}

/**
 * @description construct Isolate from a given proto
 */
function Construct(Proto, value, root, path) {
  value = ImmutableFromJS(value);
  if (!isIterable(value)) return value;

  var isolate = Object.create(Proto);
  
  // set the isolate state
  isolate._state = new IsolateState(isolate, value, path, root);
  return isolate;
}

var IsolateProto = Object.create(Iterable.prototype);

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
IsolateProto._state = null;

IsolateProto.toString = function () {
  return 'Isolate {' + isolateToString(this) + ' }';
};

function Prox(proto) {
  this.proto = proto;
}

Prox.prototype.method = function (method) {
  this.proto[method] = function () {
    return this._state[method](arguments);
  };
  return this;
};

new Prox(IsolateProto)
  .method('equals')
  .method('has')
  .method('contains')
  .method('first')
  .method('last')
  .method('merge')
  .method('mergeWith')
  .method('mergeIn')
  .method('mergeDeep')
  .method('mergeDeepWith')
  .method('mergeDeepIn')
  .method('withMutations');

/**
 * @method Isolate#get(<string>)
 */
IsolateProto.get = function get(key, notSetValue) {
  return this._state.get(key, notSetValue);
};

/**
 * @method Isolate#getIn(<Array>)
 */
IsolateProto.getIn = getIn;
function getIn(path, notSetValue) {
  if (!Array.isArray(path))
    throw new Error('path must be an array');

  return this._state.getIn(path, notSetValue);
}

function subFrom_(state, path, notSetValue) {
  var value = state.getIn(path, notSetValue);
  path = state.keyPath.concat(path);
  return isolateFromJS(value, state.root, path);
}

IsolateProto.isolateFrom
= IsolateProto.getFrom
= IsolateProto.subFrom
= IsolateProto['in']
= function subFrom(path, notSetValue) {
  if (!Array.isArray(path))
    throw new Error('path must be an array');

  if (path.length === 0) return this;
  return subFrom_(this._state, path, notSetValue);
};

IsolateProto.isolate
= IsolateProto.from
= IsolateProto.sub
= function sub(path, notSetValue) {
  if (!path && path !== 0) return this;
  return subFrom_(this._state, [path], notSetValue);
};

/**
 * @private
 */
function isFunc(obj) { return 'function' === typeof obj; }
function isStrOrNum(val) {
  return 'string' === typeof val || 'number' === typeof val;
}

IsolateProto.update
= IsolateProto.set
= function update(path, notSetValue, cb) {
  if (isFunc(path)) {
    cb = path;
    path = [];
  } else if (path == null || !isStrOrNum(path)) {
    path = [];
  } else {
    path = [path];
  }
  
  return this.updateIn(path, notSetValue, cb);
};

IsolateProto.updateIn
= IsolateProto.setIn
= function updateIn(path, notSetValue, cb) {
  if ('function' === typeof path) {
    cb = path;
    path = [];
  }

  if ('function' === typeof notSetValue) {
    cb = notSetValue;
    notSetValue = undefined;
  }

  return this._state.updateIn(path, notSetValue, cb);
};

/**
 * @method Isolate#addListener(<Function>)
 */
IsolateProto.addListener = function (cb) {
  this._state.addListener(cb);
  return this;
};

/**
 * @method Isolate#removeListener(<Function>)
 */
IsolateProto.removeListener = function (cb) {
  this._state.removeListener(cb);
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
  return this._state.deref(notSetValue);
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
function isolateToString(state) {
  var value = state.value || state.root.getIn(state.keyPath);
  if (value === undefined) value = 'undefined';
  else if (value === null) value = 'null';
  return value !== '' ? ' ' + value.toString() : '';
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

new Prox(ArrayIsolateProto)
  .method('push')
  .method('pop')
  .method('unshift')
  .method('shift');
