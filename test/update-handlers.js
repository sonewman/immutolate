var desc = require('macchiato');
var Immutolate = require('../');
var Immutable = require('immutable');

desc('Immutolate update handlers')
.it('should emit updates to handlers', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });

  var rootHandleCallCount = 0;
  isolate.addListener(function (oldValue, newValue, path) {
    rootHandleCallCount++;

    if (rootHandleCallCount === 1) {
      t.assert(oldValue.equals(Immutable.fromJS({ a: { b: { c: 2 } } })));
      t.assert(newValue.equals(Immutable.fromJS({ a: { c: 3 } })));
      t.eqls(path, []);
    } else if (rootHandleCallCount === 2) {
      t.assert(oldValue.equals(Immutable.fromJS({ a: { c: 3 } })));
      t.assert(newValue.equals(Immutable.fromJS({ a: { b: { c: 4 }, c: 3 } })));
      t.eqls(path, ['a', 'b']);
    } else {
      t.fail();
    }
  });

  var sub = isolate.subFrom(['a', 'b']);

  var subHandleCallCount = 0;
  sub.addListener(function (oldValue, newValue, path) {
    subHandleCallCount++;
    if (subHandleCallCount === 1) {
      t.equals(oldValue, undefined);
      t.assert(newValue.equals(Immutable.fromJS({ c: 4 })));
      t.eqls(path, ['a', 'b']);
    } else {
      t.fail();
    }
  });

  isolate.update(function () { return { a: { c: 3 } }; });
  sub.update(function () { return { c: 4 }; });

  t.eqls(sub.toJS(), { c: 4 });
  t.eqls(isolate.toJS(), { a: { b: { c: 4 }, c: 3 } });
  t.equals(rootHandleCallCount, 2);
  t.equals(subHandleCallCount, 1);
  t.end();
})
.it('should remove handlers', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });
  var sub = isolate.subFrom(['a', 'b']);

  function handle() {
    t.fail();
  }

  isolate.addListener(handle);
  sub.addListener(handle);
  
  isolate.removeListener(handle);
  sub.removeListener(handle);

  isolate.update(function () {
    return { a: { b:{ c: 3 } } };
  });
  sub = isolate.getIn(['a', 'b']);
  sub.update('c', function () { return 4; });

  t.end();
});
