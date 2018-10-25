const test = require("../scrapes/bvoutdoors");

test("centerfire")
  .then(f => console.log(f))
  .catch(e => console.error("ERROR", e));
