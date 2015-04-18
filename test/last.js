var desc = require('macchiato');
var Immutolate = require('../');

desc('Isolate#last')
.it('should return the last item', function (t) {
  var isolate = Immutolate.Isolate({ a: 1, b: 2, c: 3 });
  
  t.deepEquals(isolate.last(), 3);
  t.end();
});

desc('ArrayIsolate#last')
.it('should return the last item', function (t) {
  var isolate = Immutolate.ArrayIsolate([1, 2, 3, 4]);
  
  t.deepEquals(isolate.last(), 4);
  t.end();
});
