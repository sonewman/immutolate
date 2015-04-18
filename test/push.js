var desc = require('macchiato');
var Immutolate = require('../');

desc('ArrayIsolate#push')
.it('should push new item to array', function (t) {
  var isolate = Immutolate.ArrayIsolate([1, 2, 3]);
  isolate.push(4);
  
  t.deepEquals(isolate.deref(), [1, 2, 3, 4]);
  t.end();
})
.it('should push multiple items to array', function (t) {
  var isolate = Immutolate.ArrayIsolate([1, 2, 3]);
  isolate.push(4, 5, 6);
  
  t.deepEquals(isolate.deref(), [1, 2, 3, 4, 5, 6]);
  t.end();
});
