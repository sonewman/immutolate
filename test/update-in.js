var desc = require('macchiato');
var Immutolate = require('../');
var Immutable = require('immutable');

desc('Immutolate#updateIn')
.it('should update a nested value with updateIn', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });

  isolate.updateIn(['a', 'b'], function (old) {
    t.eqls(old.toJS(), { c: 2 });
    return { c: 3 };
  });
  t.eqls(isolate.toJS(), { a: { b: { c: 3 } } });
  t.end();
})
.it('should updateIn on subisolate', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: { d: 1 } } }
  });

  var sub = isolate.in(['a', 'b']);

  sub.updateIn(['c'], function (old) {
    t.eqls(old.toJS(), { d: 1 });
    return { e: 2 }; 
  });
  t.eqls(sub.toJS(), { c: { e: 2 } });
  t.eqls(isolate.toJS(), { a: { b: { c: { e: 2 } } } });
  t.end();
})
.it('should updateIn "sub" subisolate values', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: { a: 2 } } }
  });

  var sub = isolate.subFrom(['a']);
  var subsub = sub.subFrom(['b']);
  var subsubsub = subsub.subFrom(['c']);

  subsubsub.updateIn([], function (old) { 
    old = old.set('a', 3);
    return old.set('b', 4);
  });

  t.eqls(subsubsub.toJS(), { a: 3, b: 4 });
  t.eqls(isolate.toJS(), { a: { b: { c: { a: 3, b: 4 } } } });
  t.end();
});
