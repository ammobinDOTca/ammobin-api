const test = require("../scrapes/magdump");

test("centerfire")
  .then(f => console.log(f))
  .catch(e => console.error("ERROR", e));
