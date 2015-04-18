var desc = require('macchiato');
var Immutolate = require('../');

desc('ArrayIsolate#shift')
.it('should shift the last item', function (t) {
  var isolate = Immutolate.ArrayIsolate([1, 2, 3, 4]);
  isolate.shift();
  
  t.deepEquals(isolate.deref(), [2, 3, 4]);
  t.end();
});
