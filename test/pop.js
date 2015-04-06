var desc = require('macchiato');
var Immutolate = require('../');

desc('ArrayIsolate#pop')
.it('should pop the last item', function (t) {
  var isolate = Immutolate.ArrayIsolate([1, 2, 3, 4]);
  isolate.pop();
  
  t.deepEquals(isolate.deref(), [1, 2, 3]);
  t.end();
});
