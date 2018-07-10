const Influx = require('influx');

async function createInfluxClient() {

  const influxClicksDb = new Influx.InfluxDB({
    host: 'influx',
    database: 'clicks', // doh, should have been something more generic
    schema: [
      {
        measurement: 'click',
        fields: {
          url: Influx.FieldType.STRING,
          cost: Influx.FieldType.FLOAT,
          unitCost: Influx.FieldType.FLOAT,
          count: Influx.FieldType.INTEGER,
          name: Influx.FieldType.STRING,
        },
        tags: [
          'userAgent',
          'vendor',
          'province',
          'brand',
          'calibre',
        ]
      },
      {
        measurement: 'view',
        fields: { v: Influx.FieldType.BOOLEAN },
        tags: [
          'userAgent',
          'brand',
          'calibre',
        ]
      },
      {
        measurement: 'item',
        fields: {
          name: Influx.FieldType.STRING,
          price: Influx.FieldType.FLOAT,
          unitCost: Influx.FieldType.FLOAT,
        },
        tags: [
          'vendor',
          'province',
          'brand',
          'calibre',
        ]
      },
      {
        measurement: 'scrape',
        fields: {
          results: Influx.FieldType.INTEGER,
          time: Influx.FieldType.INTEGER,
        },
        tags: [
          'vendor',
          'type',
        ]
      },
      {
        measurement: 'scrape-failure',
        fields: {
          time: Influx.FieldType.INTEGER,
          error: Influx.FieldType.STRING
        },
        tags: [
          'vendor',
          'type',
        ]
      }
    ]
  })

  const names = await influxClicksDb.getDatabaseNames()
  if (!names.includes('clicks')) {
    await influxClicksDb.createDatabase('clicks');
  }

  return influxClicksDb;
}

module.exports = {
  logClick(url, userAgent, item) {
    return createInfluxClient()
      .then(influxClicksDb =>
        influxClicksDb.writePoints([
          {
            measurement: 'clicks',
            tags: {
              userAgent,
              vendor: item.vendor,
              province: item.province,
              brand: item.brand,
              calibre: item.calibre
            },
            fields: {
              url,
              price: item.price || 0,
              unitCost: item.unitCost || 0,
              count: item.count || 0,
              name: item.name,
            }
          }
        ])
      )
  },
  logView(userAgent, brand, calibre) {
    return createInfluxClient()
      .then(influxClicksDb =>
        influxClicksDb.writePoints([
          {
            measurement: 'view',
            tags: {
              userAgent,
              brand,
              calibre
            },
            fields: { v: true }
          }
        ])
      )
  },
  logItem(item) {
    return createInfluxClient()
      .then(influxClicksDb =>
        influxClicksDb.writePoints([
          {
            measurement: 'item',
            tags: {
              vendor: item.vendor,
              province: item.province,
              brand: item.brand,
              calibre: item.calibre
            },
            fields: {
              price: item.price || 0,
              unitCost: item.unitCost || null,
              name: item.name,
            }
          }
        ])
      )
  },
  logScrapeResult(type, vendor, results, time) {
    return createInfluxClient()
      .then(influxClicksDb =>
        influxClicksDb.writePoints([
          {
            measurement: 'scrape',
            tags: {
              vendor,
              type
            },
            fields: {
              results,
              time
            }
          }
        ])
      )
  },
  logScrapeFail(type, vendor, time, error) {
    return createInfluxClient()
      .then(influxClicksDb =>
        influxClicksDb.writePoints([
          {
            measurement: 'scrape-failure',
            tags: {
              vendor,
              type
            },
            fields: {
              time,
              error
            }
          }
        ])
      )
  },
}
