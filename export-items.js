const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

/**
 * move the clicks out of redis and into influx
 */

client.keys('2017-08-26*', (err, keys) => {
  if (err) {
    throw err;
  }

  client.mget(keys, (err2, items) => {
    if (err2) {
      throw err2;
    }
    console.log('name,price,vendor,province,calibre,brand,count,unitCost')
    const keys = 'name,price,vendor,province,calibre,brand,count,unitCost'.split(',')
    items
      .map(i => JSON.parse(i))
      // .forEach(i => i.map(i => Object.keys(i).map(k => i[k]).join(',')))
      .forEach(i =>
        i.filter(ii => ii.price)
          .map(ii =>
            console.log(keys.map(k => typeof ii[k] === 'string' ? ii[k].replace(/,/g, ' ').replace(/\t/g, '').replace(/\n/g, '').trim() : ii[k]).join(','))))
    process.exit();
  });

})
