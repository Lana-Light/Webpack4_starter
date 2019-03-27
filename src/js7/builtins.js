//import _ from 'lodash';
let ti = 5;
Promise.resolve().finally();
(async function work() {
  var a = await Promise.resolve("a");
  console.log(a);
  var b = await Promise.resolve("b");
  console.log(b);
})();
