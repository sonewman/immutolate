var desc = require('macchiato');
var Immutolate = require('../');

desc('Isolate#getIn')
.it('should return correct values', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });
  
  t.deepEquals(
    isolate.getIn(['a']).toJS(),
    { b: { c: 2 } }
  );

  t.deepEquals(
    isolate.getIn(['a', 'b']).toJS(),
    { c: 2 }
  );
  
  t.equals(isolate.getIn(['a', 'b', 'c']), 2);
  t.end();
});

desc('ArrayIsolate#getIn')
.it('should return correct values', function (t) {
  var isolate = Immutolate.ArrayIsolate([
    { a: 1 },
    { b: 2 }, 
    { c: 2 }
  ]);
  
  t.deepEquals(isolate.getIn([0]).toJS(), { a: 1 });
  t.deepEquals(isolate.getIn([0, 'a']), 1);
  t.end();
});
