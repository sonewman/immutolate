var Immutable = require('immutable');
var isList = Immutable.List.isList;
var Iterable = Immutable.Iterable;
var isIterable = Iterable.isIterable;

var protos = require('../');
var IsolateProto = protos.IsolateProto;
var ArrayIsolateProto = protos.ArrayIsolateProto;

var utils = require('../utils');
var Update = utils.Update;
var Construct = utils.Construct;
var handlePath = utils.handlePath;
console.log(Construct)

// remove this duplication
function fromJS(value, root, path) {
  var proto = Array.isArray(value) || isList(value)
    ? ArrayIsolateProto
    : IsolateProto;
  
  return Construct(proto, value, root, path);
}

var ImmutableProto = Object.create(null);

function ImmutableIsolate() {}

ImmutableProto.constructor = ImmutableIsolate;
ImmutableIsolate.prototype = ImmutableProto;

ImmutableProto.fromJS = null;

ImmutableProto.equals = function equals(iso, other) {
  
};

ImmutableProto.getIn = function getIn(iso, path, notSetValue) {
  var root = iso._root;
  var rootValue = root._value;
  var value = isIterable(rootValue) 
    ? rootValue.getIn(path, notSetValue)
    : rootValue;
  
  return fromJS(value, root, path);
};

ImmutableProto.updateIn = function updateIn(root, args) {
  
};

module.exports = Object.create(ImmutableProto);
