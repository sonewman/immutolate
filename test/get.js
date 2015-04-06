var desc = require('macchiato');
var Immutolate = require('../');

desc('Creating an Immutable Isolate')
.it('should take value and allow retrieval', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });
  
  t.deepEquals(isolate.deref(), { a: { b: { c: 2} } });
  t.end();
})
.it('should not make an Isolate if value is string or number', function (t) {
  var value = Immutolate.Isolate(4);
  t.equals(value, 4);
  
  value = Immutolate.Isolate('string');
  t.equals(value, 'string');

  t.end();
})
.it('should create subisolates', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });
  
  var a = isolate.get('a');
  t.deepEquals(
    a.deref(),
    { b: { c: 2 } }
  );
  t.deepEquals(
    isolate.getIn(['a']).deref(),
    { b: { c: 2 } }
  );

  t.deepEquals(
    isolate.getIn(['a', 'b']).deref(),
    { c: 2 }
  );
  
  t.equals(isolate.getIn(['a', 'b', 'c']), 2);
  t.end();
});
