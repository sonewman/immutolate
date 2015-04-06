var Immutable = require('immutable');
var fromJS = Immutable.fromJS;
var Iterable = Immutable.Iterable;
var isIterable = Iterable.isIterable;


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

exports.handlePath = handlePath;

/**
 * @description construct Isolate from a given proto
 */
function Construct(Proto, value, root, path) {
  value = fromJS(value);
  if (!isIterable(value)) return value;

  var isolate = Object.create(Proto);
  isolate._listener = null;

  // set the isolate Orchestrator
  isolate.Orchestrator = ImmutableOrchestrator;

  if (Array.isArray(path)) {
    isolate._key = path.join('.');
    isolate._keyPath = path;
  } else {
    isolate._key = path && path === 0 ? path : '';
    isolate._keyPath = handlePath(isolate._key);
  }

  if (root) {
    isolate._root = root;
  } else {
    isolate._root = isolate;
    isolate._listeners = [];
    Set(isolate, value);
  }
  
  return isolate;
}

exports.Construct = Construct;

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

/**
 * @private
 */
function Call(method, ctx, args) {
  ctx = ctx || null;
  switch (args.length) {
    case 0: return method.call(ctx);
    case 1: return method.call(ctx, args[0]);
    case 2: return method.call(ctx, args[0], args[1]);
    case 3: return method.call(ctx, args[0], args[1], args[2]);
    case 4: return method.call(ctx, args[0], args[1], args[2], args[3]);
    default: return method.apply(ctx, args);
  }
}

exports.Call = Call;

/**
 * @private
 */
function makeUpdateCallback(method, args) {
  return function updateCallback(oldValue) {
    return Call(oldValue[method], oldValue, args);
  };
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

/**
 * @private
 */
function Set(iso, newValue) {
  iso._value = newValue;
  iso.size = newValue ? newValue.size : 0;
}

exports.Set = Set;

/**
 * @private
 */
function update_(iso, method, args) {
  var root = iso._root;
  var cb = makeUpdateCallback(method, args);

  //console.log(root, iso._keyPath, cb);
  var oldValue = root._value;
  //console.log('oldValue', oldValue);
  
  newValue = fromJS(cb(oldValue));
  //console.log('newValue', newValue);
  
  // if new value is not equal to old value then update the data
  if (!newValue.equals(oldValue)) {
    Set(root, newValue);

    // then emit changes...
    dispatch(root._listeners, iso._keyPath, oldValue, newValue);
  }

  return iso;
}

function Update(iso, method, args) {
  return update_(iso, method, normUpdateArgs(iso._keyPath, args));
}

exports.Update = Update;
var ImmutableOrchestrator = require('./lib/immutable');
