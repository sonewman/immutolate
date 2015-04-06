var desc = require('macchiato');
var Immutolate = require('../');
var Immutable = require('immutable');

desc('Merging an Immutable Isolate')
.it('should merge', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });

  isolate.merge({ a: { c: 1, b: { a: 3 } } });
  t.deepEquals(isolate.deref(), { a: { b: { a: 3 }, c: 1 } });
  t.end();
})
.it('should mergeIn', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });

  isolate.mergeIn(['a', 'b'], { a: 3 });
  t.deepEquals(isolate.deref(), { a: { b: { c: 2, a: 3 } } });
  t.end();
})
.it('should mergeWith', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });

  isolate.mergeWith(function (oldValue, newValue) {
    t.assert(oldValue.equals(Immutable.fromJS({ b: { c: 2 } })));
    t.assert(newValue.equals(Immutable.fromJS({ c: 1, b: { a: 3 } })));
    return newValue;
  },
  { a: { c: 1, b: { a: 3 } } });

  t.deepEquals(isolate.deref(), { a: { b: { a: 3 }, c: 1 } });
  t.end();
})
//.it('should mergeDeep', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { b: { c: 2 } }
//  });
//
//  isolate.mergeDeep({ a: { c: 1, b: { a: 3 } } });
//  t.deepEquals(isolate.deref(), { a: { b: { c: 2, a: 3 }, c: 1 } });
//  t.end();
//})
//.it('should mergeDeepWith', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { c: 3, b: { c: 2, a: 4 } }
//  });
//  
//  var count = 0;
//  isolate.mergeDeepWith(function (oldValue, newValue) {
//    if (++count === 1) {
//      t.equals(oldValue, 3);
//      t.equals(newValue, 1);
//
//    } else if (count === 2) {
//      t.equals(oldValue, 4);
//      t.equals(newValue, 3);
//    }
//    return oldValue - newValue;
//  },
//  { a: { c: 1, b: { a: 3 } } });
//
//  t.deepEquals(isolate.deref(), { a: { c: 2, b: { c: 2, a: 1 } } });
//  t.end();
//})
//.it('should mergeDeepIn', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { c: 3, b: { c: 2, a: 4 } }
//  });
//  
//  isolate.mergeDeepIn(['a'], { c: 1, b: { a: 3 } });
//  t.deepEquals(isolate.deref(), { a: { c: 1, b: { c: 2, a: 3 } } });
//  t.end();
//});
