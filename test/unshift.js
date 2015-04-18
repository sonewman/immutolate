var desc = require('macchiato');
var Immutolate = require('../');

desc('ArrayIsolate#unshift')
.it('should unshift new item to array', function (t) {
  var isolate = Immutolate.ArrayIsolate([1, 2, 3]);
  isolate.unshift(4);
  
  t.deepEquals(isolate.deref(), [4, 1, 2, 3]);
  t.end();
})
.it('should unshift multiple items to array', function (t) {
  var isolate = Immutolate.ArrayIsolate([1, 2, 3]);
  isolate.unshift(4, 5, 6);
  
  t.deepEquals(isolate.deref(), [4, 5, 6, 1, 2, 3]);
  t.end();
});
