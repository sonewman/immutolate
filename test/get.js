var desc = require('macchiato');
var Immutolate = require('../');

desc('Isolate#get')
.it('should return correct values', function (t) {
  var isolate = Immutolate.Isolate({
    a: { b: { c: 2 } }
  });
  
  var a = isolate.get('a');
  t.deepEquals(
    a.toJS(),
    { b: { c: 2 } }
  );
  t.end();
});

desc('ArrayIsolate#get')
.it('should return correct values', function (t) {
  var isolate = Immutolate.ArrayIsolate([
    { a: 1 },
    { b: 2 }, 
    { c: 2 }
  ]);
  
  t.deepEquals(isolate.get(0).toJS(), { a: 1 });
  t.end();
});
