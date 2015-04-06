var desc = require('macchiato');
var Immutolate = require('../');
var Immutable = require('immutable');

desc('Updating an Immutable Isolate')
//.it('should update full data structure', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { b: { c: 2 } }
//  });
//
//  isolate.update(function () {
//    return { a: { b: { c: 3 } } };
//  });
//  t.eqls(isolate.toJS(), { a: { b: { c: 3 } } });
//  t.end();
//})
//.it('should update a nested value with updateIn', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { b: { c: 2 } }
//  });
//
//  isolate.updateIn(['a', 'b'], function (old) {
//    t.eqls(old.toJS(), { c: 2 });
//    return { c: 3 };
//  });
//  t.eqls(isolate.toJS(), { a: { b: { c: 3 } } });
//  t.end();
//})
//.it('should update subisolate', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { b: { c: 2 } }
//  });
//
//  var sub = isolate.get(['a', 'b']);
//
//  sub.update(function (old) {
//    t.eqls(old.toJS(), { c: 2 });
//    return { c: 4 }; 
//  });
//  t.eqls(sub.toJS(), { c: 4 });
//  t.eqls(isolate.toJS(), { a: { b: { c: 4 } } });
//  t.end();
//})
//.it('should updateIn on subisolate', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { b: { c: { d: 1 } } }
//  });
//
//  var sub = isolate.get(['a', 'b']);
//
//  sub.updateIn(['c'], function (old) {
//    console.log(old)
//    t.eqls(old.toJS(), { d: 1 });
//    return { e: 2 }; 
//  });
//  t.eqls(sub.toJS(), { c: { e: 2 } });
//  t.eqls(isolate.toJS(), { a: { b: { c: { e: 2 } } } });
//  t.end();
//})
.it('should update "sub" subisolate values', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: { a: 2 } } }
  });

  var sub = isolate.get(['a']);
  var subsub = sub.get(['b']);
  var subsubsub = subsub.get(['c']);
  subsubsub.update(function (old) { 
    old = old.set('a', 3);
    return old.set('b', 4);
  });
  t.eqls(subsubsub.toJS(), { a: 3, b: 4 });
  t.eqls(isolate.toJS(), { a: { b: { c: { a: 3, b: 4 } } } });
  t.end();
})
//.it('should emit updates to handlers', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { b: { c: 2 } }
//  });
//
//  var rootHandleCallCount = 0;
//  isolate.addListener(function (oldValue, newValue, path) {
//    rootHandleCallCount++;
//
//    if (rootHandleCallCount === 1) {
//      t.assert(oldValue.equals(Immutable.fromJS({ a: { b: { c: 2 } } })));
//      t.assert(newValue.equals(Immutable.fromJS({ a: { c: 3 } })));
//      t.eqls(path, []);
//    } else if (rootHandleCallCount === 2) {
//      t.assert(oldValue.equals(Immutable.fromJS({ a: { c: 3 } })));
//      t.assert(newValue.equals(Immutable.fromJS({ a: { b: { c: 4 }, c: 3 } })));
//      t.eqls(path, ['a', 'b', 'c']);
//    } else {
//      t.fail();
//    }
//  });
//
//  var sub = isolate.get('a.b.c');
//
//  var subHandleCallCount = 0;
//  sub.addListener(function (oldValue, newValue, path) {
//    subHandleCallCount++;
//    if (subHandleCallCount === 1) {
//      t.equals(oldValue, undefined);
//      t.equals(newValue, 4);
//      t.eqls(path, ['a', 'b', 'c']);
//    } else {
//      t.fail();
//    }
//  });
//
//  isolate.update(function () {
//    return { a: { c: 3 } }; 
//  });
//
//  sub.update(function () { return 4; });
//  t.eqls(sub.toJS(), 4);
//  t.eqls(isolate.toJS(), { a: { b: { c: 4 }, c: 3 } });
//  t.equals(rootHandleCallCount, 2);
//  t.equals(subHandleCallCount, 1);
//  t.end();
//})
//.it('should remove handlers', function (t) {
//  var isolate = Immutolate.Isolate({
//    a: { b: { c: 2 } }
//  });
//  var sub = isolate.getIn(['a', 'b']);
//
//  function handle() {
//    t.fail();
//  }
//
//  isolate.addListener(handle);
//  sub.addListener(handle);
//  
//  isolate.removeListener(handle);
//  sub.removeListener(handle);
//
//  isolate.update(function () {
//    return { a: { c: 3 } };
//  });
//  sub = isolate.get(['a', 'b', 'c']);
//  sub.update(function () { return 4; });
//
//  t.end();
//});
