const Influx = require('influx');

const influxClicksDb = new Influx.InfluxDB({
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

const prom = influxClicksDb.getDatabaseNames()
  .then(names => {
    if (!names.includes('clicks')) {
      return influxClicksDb.createDatabase('clicks');
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
        influxClicksDb.writePoints([
          {
            measurement: 'clicks',
            tags: { userAgent, vendor },
            fields: { url }
          }
        ])
      )
  },
  // tmp. remove once redis no longer sole db
  influxClicksDb
}