const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

/**
 * move the clicks out of redis and into influx
 */

client.keys('*', (err, keys) => {
  if (err) {
    throw err;
  }


  client.mget(keys.filter(k => ['rimfire', 'centerfire', 'shotgun'].some(s => k.includes(s))), (err2, items) => {
    if (err2) {
      throw err2;
    }

    // console.log('name,price,vendor,province,calibre,brand')
    // const keys = 'name,price,vendor,province,calibre,brand'.split(',')
    console.log('name,price,vendor,province,calibre,brand,count,unitCost')
    const keys = 'name,price,vendor,province,calibre,brand,count,unitCost'.split(',')
    items
      .map(i => JSON.parse(i))
      // .forEach(i => i.map(i => Object.keys(i).map(k => i[k]).join(',')))
      .forEach(i =>
        i.filter(ii => ii.price && ii.price > 1).filter(ii => ii.calibre).map(ii => {
          ii.unitCost = ii.unitCost ? Math.round(ii.unitCost * 100) : 0
          ii.count = ii.count > 0 && ii.count < 3500 ? ii.count : 0
          return ii
        })
          .map(ii =>
            console.log(keys.map(k => typeof ii[k] === 'string' ? ii[k].replace(/,/g, ' ').replace(/\t/g, '').replace(/\n/g, '').trim() : ii[k]).join(','))))
    process.exit();
  });

})
