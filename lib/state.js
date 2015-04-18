var Immutable = require('immutable');
var isList = Immutable.List.isList;
var Iterable = Immutable.Iterable;
var isIterable = Iterable.isIterable;

var protos = require('../');
var IsolateProto = protos.IsolateProto;
var ArrayIsolateProto = protos.ArrayIsolateProto;

function forEach(arr, cb) {
  for (var i = 0, l = arr.length; i < l; i += 1) cb(arr[i]);
}

function deepClone(obj) {
  var keys, cl;

  if (Array.isArray(obj)) {
    cl = [];
    forEach(obj, function (v) { cl.push(deepClone(v)); });
  } else if (obj && 'object' === typeof obj) {
    cl = {};
    forEach(Object.keys(obj), function (k) { cl[k] = deepClone(obj[k]); });
  } else {
    return obj;
  }
}

/**
 * @private
 */
function Call(ctx, name, args) {
  var method = ctx[name];
  switch (args.length) {
    case 0: return method.call(ctx);
    case 1: return method.call(ctx, args[0]);
    case 2: return method.call(ctx, args[0], args[1]);
    case 3: return method.call(ctx, args[0], args[1], args[2]);
    case 4: return method.call(ctx, args[0], args[1], args[2], args[3]);
    default: return method.apply(ctx, args);
  }
}

/**
 * @private
 */
function compareListener(path1, path2) {
  var l1 = path1.length;
  for (var i = 0; i < l1; i += 1) {
    if (path1[i] !== path2[i]) return false;
  }
  return true;
}

/**
 * @private
 */
function dispatchToHandlers(listener, path, oldValue, newValue) {
  var handlers = listener.handlers;
  var keyPath = listener.keyPath;

  if (keyPath.length > 0) {
    oldValue = oldValue.getIn(keyPath);
    newValue = newValue.getIn(keyPath);
  }

  for (var i = 0; i < handlers.length; i += 1)
    handlers[i](oldValue, newValue, path);
}

/**
 * @private
 */
function dispatch(listeners, path, oldValue, newValue) {
  for (var i = 0; i < listeners.length; i += 1) {
    var listener = listeners[i];
    if (compareListener(listener.keyPath, path))
      dispatchToHandlers(listener, path, oldValue, newValue);
  }
}

function normUpdateArgs(keyPath, rawArgs) {
  var len = rawArgs.length;

  if (len === 1) {
    return [keyPath, rawArgs[0]];
  } else if (len > 1) {
    var args = [keyPath.concat(rawArgs[0]), rawArgs[1]];
    if (len > 2) args.push(rawArgs[2]);
    return args;
  }
  return [];
}

function IsolateState(iso, value, path, root) {
  this.iso = iso;
  this.keyPath = path ? (Array.isArray(path) ? path : [path]) : [];

  this.isImmutable = false;
  
  if (root) {
    this.root = root;
  } else {
    this.root = this;
    this.listeners = [];
    this.setValue(value);
  }
}
var StateProto = IsolateState.prototype;
StateProto.constructor = IsolateState;
StateProto.iso = null;
StateProto.value = null;
StateProto.keyPath = null;
StateProto.listener = null;
StateProto.listeners = null;

module.exports = IsolateState;

StateProto.setValue = function setValue(newValue) {
  this.value = newValue;
  this.iso.size = newValue ? newValue.size : 0;
};

function fullPath(state, path) {
  return state.keyPath.concat(path);
}
  
function createUpdater(cb) {
  return function updater(oldValue, path) {
    return Immutable.fromJS(cb(oldValue, path));
  };
}

StateProto.update = function update(path, notSetValue, cb) {
  var oldValue = this.rootValue();
  newValue = oldValue.updateIn(path, notSetValue, createUpdater(cb));
  
  // if new value is not equal to old value then update the data
  if (!newValue.equals(oldValue)) {
    this.root.setValue(newValue);

    // then emit changes...
    dispatch(this.root.listeners, path, oldValue, newValue);
  }

  return this.iso;
};

function relativeValue(root, path, notSetValue) {
  return isIterable(root) 
    ? root.getIn(path, notSetValue)
    : (root || notSetValue);
}

StateProto.rootValue = function rootValue() {
  return this.root && this.root.value;
};

StateProto.getValue = function getValue() {
  return relativeValue(this.rootValue(), this.keyPath, undefined);
};

StateProto.relativeValue = function value(path, notSetValue) {
  return relativeValue(this.rootValue(), this.keyPath.concat(path), notSetValue);
};

StateProto.has = function has(key) {
  var v = this.getValue();
  v && v.has && v.has(key);
};

StateProto.contains = function contains(key) {

};

StateProto.equals = function equals(that) {
  if (that === this.iso) return true;
  var value = this.getValue();
  return value === that || (!!value.equals && value.equals(that));
};

StateProto.get = function get(key, notSetValue) {
  if (key == null) return this.getValue();
  return this.relativeValue(key, notSetValue);
};

StateProto.getIn = function getIn(path, notSetValue) {
  return this.relativeValue(path, notSetValue);
};

StateProto.updateIn = function update(path, notSetValue, cb){
  path = this.keyPath.concat(path);
  return this.update(path, notSetValue, cb);
};

StateProto.deref = function deref(notSetValue) {
  var value = this.getValue();
  return ((value && value.toJS) ? value.toJS() : value) || notSetValue;
};

function updateCallback(name, args) {
  return function makeUpdate(old) {
    return Call(old, name, args);
  };
}

function updateWith(state, method, args) {
  state.root.update([], undefined, updateCallback(method, args));
  return state.iso;
}

StateProto.merge = function merge(args) {
  return updateWith(this, 'merge', args);
};

StateProto.mergeWith = function mergeWith(args) {
  return updateWith(this, 'mergeWith', args);
};

StateProto.mergeIn = function mergeIn(args) {
  return updateWith(this, 'mergeIn', args);
};

StateProto.mergeDeep = function mergeDeep(args) {
  return updateWith(this, 'mergeDeep', args);
};

StateProto.mergeDeepIn = function mergeDeepIn(args) {
  return updateWith(this, 'mergeDeepIn', args);
};

StateProto.mergeDeepWith = function mergeDeepWith(args) {
  return updateWith(this, 'mergeDeepWith', args);
};

StateProto.withMutations = function withMutations(args) {
  return updateWith(this, 'withMutations', args);
};

// ArrayImmutable Methods:

StateProto.pop = function pop(args) {
  return updateWith(this, 'pop', args);
};

StateProto.push = function push(args) {
  return updateWith(this, 'push', args);
};

StateProto.shift = function shift(args) {
  return updateWith(this, 'shift', args);
};

StateProto.unshift = function unshift(args) {
  return updateWith(this, 'unshift', args);
};

StateProto.first = function first() {
  var value = this.getValue();
  return isIterable(value)
    ? value.first()
    // improve in non-immutable
    : value;
};

StateProto.last = function last() {
  var value = this.getValue();
  return isIterable(value)
    ? value.last()
    // improve in non-immutable
    : value;
};


// Listeners

/**
 * @class Listener
 * @private
 */
function Listener(keyPath) {
  this.keyPath = keyPath;
  this.handlers = [];
}


StateProto.addListener = function addListener(cb) {
  if (!this.listener) {
    this.listener = new Listener(this.keyPath);
    this.root.listeners.push(this.listener);
  }

  this.listener.handlers.push(cb);
};

StateProto.removeListener = function removeListener(cb) {
  var listener = this.listener;

  if (listener) {
    var handlers = listener.handlers;
    var i = handlers.indexOf(cb);
    handlers.splice(i, 1);

    if (handlers.length === 0) {
      var rootListeners = this.root.listeners;
      i = rootListeners.indexOf(listener);
      rootListeners.splice(i, 0);
      this.listener = null;
    }
  }
};
