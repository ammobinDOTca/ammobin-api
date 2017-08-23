const Influx = require('influx');

const influx = new Influx.InfluxDB({
  host: 'influx',
  database: 'clicks',
  schema: [
    {
      measurement: 'click',
      fields: {
        // todo add item + cost + per round count
        url: Influx.FieldType.STRING
      },
      tags: [
        'userAgent',
        'vendor'
      ]
    }
  ]
});

const prom = influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('clicks')) {
      return influx.createDatabase('clicks');
    }
  })
  .catch(e => {
    console.error('FAILED to connect to influx', e);
    throw e;
  });


module.exports = {
  logClick(url, vendor, userAgent) {
    return prom
      .then(() =>
        influx.writePoints([
          {
            measurement: 'clicks',
            tags: { userAgent, vendor },
            fields: { url },
          }
        ])
      )
  }
}