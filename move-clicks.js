const redis = require('redis');
const client = redis.createClient({ host: 'redis' });
const influx = require('./influx');
const moment = require('moment')

/**
 * move the clicks out of redis and into influx
 */

client.keys('*CLICK*', (err, keys) => {
  if (err) {
    throw err;
  }

  client.mget(keys, (err2, counts) => {
    if (err2) {
      throw err2;
    }

    influx.influxClicksDb.writePoints(keys.reduce((points, key, index) => {
      const count = counts[index];
      const split = key.split('_');
      const vendor = split[2];
      const timestamp = moment(split[3], 'YYYY-MM-DD').toDate();
      const url = vendor;
      for (let i = 0; i < count; i++) {
        const point = {
          measurement: 'clicks',
          tags: { vendor, userAgent: 'redis-transfer' },
          fields: { url },
          timestamp
        };
        points.push(point);
      }

      return points;
    }, []))
      .then(res => {
        console.log('finished', res)
        client.quit();
      })
      .catch(e => {
        console.error('ERROR', e)
      })
  });

})
