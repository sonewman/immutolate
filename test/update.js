var desc = require('macchiato');
var Immutolate = require('../');
var Immutable = require('immutable');

desc('Immutolate.update')
.it('should update full data structure', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });

  isolate.update(function () {
    return { a: { b: { c: 3 } } };
  });
  t.eqls(isolate.toJS(), { a: { b: { c: 3 } } });
  t.end();
})
.it('should update subisolate', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });

  var sub = isolate.in(['a', 'b']);
  sub.update(function (old) {
    t.eqls(old.toJS(), { c: 2 });
    return { c: 4 }; 
  });

  t.eqls(sub.toJS(), { c: 4 });
  t.eqls(isolate.toJS(), { a: { b: { c: 4 } } });
  t.end();
})
.it('should update "sub" subisolate values', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: { a: 2 } } }
  });

  var sub = isolate.sub('a');
  var subsub = sub.sub('b');
  var subsubsub = subsub.sub('c');

  subsubsub.update(function (old) { 
    old = old.set('a', 3);
    return old.set('b', 4);
  });

  t.eqls(subsubsub.toJS(), { a: 3, b: 4 });
  t.eqls(isolate.toJS(), { a: { b: { c: { a: 3, b: 4 } } } });
  t.end();
});
