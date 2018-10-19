const Hapi = require("hapi");
const redis = require("redis");
const hapiCron = require("hapi-cron");
const moment = require("moment");
const boom = require("boom");
const url = require("url");
const RedisSMQ = require("rsmq");
const helpers = require("../helpers");
const fs = require("fs");

const {
  SOURCES,
  DATE_FORMAT,
  CACHE_REFRESH_HOURS,
  QUEUE_NAME
} = require("../constants");
const influx = require("./influx");

const rsmq = new RedisSMQ({ host: "redis" });
const client = redis.createClient({ host: "redis" });
const logger = require("../logger").apiLogger;
const secretRefreshKey = Math.round(Math.random() * 10000000000).toString(); // required to only allow us to refresh the cache on our terms
console.log("secretRefreshKey", secretRefreshKey);

rsmq.listQueues(function(err, queues) {
  if (err) {
    logger.error({ type: "failed-to-list-rsmq-queues", error: err.toString() });
    throw err;
  }
  if (queues.indexOf(QUEUE_NAME) === -1) {
    rsmq.createQueue({ qname: QUEUE_NAME }, function(err, resp) {
      if (err) {
        logger.error({
          type: "failed-to-create-rsmq-queues",
          error: err.toString()
        });
        throw err;
      }
      if (resp === 1) {
        logger.info({ type: "rsmq-queue-created" });
      }
    });
  }
});

const server = new Hapi.Server({
  cache: [
    {
      engine: require("catbox-redis"),
      host: "redis",
      partition: "cache"
    }
  ],
  routes: { cors: true },
  host: "0.0.0.0",
  port: process.env.PORT || 8080
});

const classifiedListsCache = server.cache({
  expiresIn: (CACHE_REFRESH_HOURS + 2) * 60 * 1000, // make sure that this can stay around till after the next refresh cycle
  segment: "classifiedLists",
  generateFunc: async function(type) {
    // pull everything out of cache
    const keys = SOURCES.map(s => helpers.getKey(s, type));

    const results = await new Promise((resolve, reject) =>
      client.mget(
        keys,
        (err, res) =>
          err ? reject(err) : resolve(res.map(r => (r ? JSON.parse(r) : null)))
      )
    );

    const result = results
      .reduce((final, r) => (r ? final.concat(r) : final), [])
      .filter(r => r && r.price > 0 && r.calibre && r.calibre !== "UNKNOWN")
      .sort(function(a, b) {
        if (a.price > b.price) {
          return 1;
        } else if (a.price < b.price) {
          return -1;
        } else {
          return 0;
        }
      });
    if (result.length === 0) {
      logger.info({ type: "no-results-found", group: type });
    }

    const itemsGrouped = result.reduce((r, item) => {
      const key = item.calibre + "_" + item.brand;
      if (!r[key]) {
        r[key] = {
          name: `${item.brand} ${item.calibre}`,
          calibre: item.calibre,
          brand: item.brand,
          minPrice: item.price,
          maxPrice: item.price,
          minUnitCost: item.unitCost || 0,
          maxUnitCost: item.unitCost || 0,
          img: item.img,
          vendors: [item]
        };
      } else {
        const val = r[key];
        val.minPrice = Math.min(item.price, val.minPrice);
        val.maxPrice = Math.max(item.price, val.maxPrice);

        if (item.unitCost) {
          if (val.minUnitCost === 0) {
            val.minUnitCost = item.unitCost;
          }
          val.minUnitCost = Math.min(item.unitCost, val.minUnitCost);
          val.maxUnitCost = Math.max(item.unitCost, val.maxUnitCost);
        }

        val.img = val.img || item.img;
        val.vendors.push(item);
      }
      return r;
    }, {});
    return Object.keys(itemsGrouped).map(k => itemsGrouped[k]);
  },
  generateTimeout: 6000
});

const bestPricesCache = server.cache({
  expiresIn: CACHE_REFRESH_HOURS * 2 * 60 * 1000, // make sure that this can stay around till after the next refresh cycle
  segment: "bestPrices",
  generateFunc: async function() {
    const keys = SOURCES.map(s => helpers.getKey(s, "centerfire"));
    const res = await new Promise((resolve, reject) =>
      client.mget(keys, (err, res) => (err ? reject(err) : resolve(res)))
    );
    const results = res.map(r => (r ? JSON.parse(r) : null));
    const result = results
      .reduce((final, result) => {
        return result && result.length ? final.concat(result) : final;
      }, [])
      .reduce((response, item) => {
        if (
          !item ||
          !item.calibre ||
          !item.unitCost ||
          item.calibre === "UNKNOWN"
        ) {
          return response;
        }

        if (!response[item.calibre]) {
          response[item.calibre] = Number.MAX_SAFE_INTEGER;
        }

        response[item.calibre] = Math.min(
          response[item.calibre],
          item.unitCost
        );

        return response;
      }, {});

    return result;
  },
  generateTimeout: 5000
});

// Add the route
server.route({
  method: "GET",
  path: "/",
  handler: () => "hi"
});

server.route({
  method: "GET",
  path: "/ping",
  handler: () => "pong"
});

server.route({
  method: "POST",
  path: "/submit-address",
  handler: async function(request, h) {
    const body = request.payload;

    if (
      !body ||
      ["name", "address", "city", "province", "postal"].some(
        k => !body[k] || body[k].length > 1000
      )
    ) {
      throw boom.badRequest("missing required field...");
    }

    const info = {
      name: body.name.replace(/[^\w\s]/gi, ""),
      address: body.address.replace(/[^\w\s]/gi, ""),
      city: body.city.replace(/[^\w\s]/gi, ""),
      province: body.province.replace(/[^\w\s]/gi, ""),
      postal: body.postal.replace(/[^\w\s]/gi, ""),
      note: (body.note || "").replace(/[^\w\s]/gi, "")
    };

    await new Promise((resolve, reject) =>
      fs.appendFile(
        "logs/submitted-addresses.csv",
        `${info.name},${info.address},${info.city},${info.city},${
          info.province
        },${info.postal},${info.note}\n`,
        err => (err ? reject(err) : resolve())
      )
    );

    return h.response("success");
  }
});

server.route({
  method: "POST",
  path: "/track-view",
  handler: function(request, h) {
    // record user agent + calibre + brand that user opened up
    const userAgent = request.headers["user-agent"] || "unknown";
    const body = request.payload;
    //await influx.logView(userAgent, body.brand, body.calibre);
    logger.info({
      type: "track-view",
      userAgent,
      brand: body.brand,
      calibre: body.calibre,
      body
    });
    return h.response("success");
  }
});

server.route({
  method: "GET",
  path: "/track-outbound-click",
  handler: async function(request, h) {
    if (!request.query.url) {
      throw boom.badRequest("missing required param: url");
    }

    const targetUrl = url.parse(request.query.url);

    const host = targetUrl.hostname
      ? targetUrl.hostname.replace("www.", "")
      : "";
    if (SOURCES.indexOf(host) === -1) {
      throw boom.badRequest("invalid target url");
    }
    const date = moment.utc().format(DATE_FORMAT);

    try {
      const results = await new Promise((resolve, reject) =>
        client.mget(
          ["rimfire", "shotgun", "centerfire"].map(
            type => `${date}_${host}_${type}`
          ),
          (err, res) => (err ? reject(err) : resolve(res.map(JSON.parse)))
        )
      ).then(helpers.combineResults);

      const encoded = encodeURIComponent(request.query.url);
      const record = results.find(
        r => r && r.link && r.link.indexOf(encoded) >= 0
      ); // !!({} && -1) === true

      if (!record) {
        console.warn(
          "WARN: unable to find matching record for " + request.query.url
        );
      }

      await influx.logClick(
        request.query.url,
        request.headers["user-agent"],
        record ? record : {}
      );
      logger.info({
        type: "track-outbound-click",
        url: request.query.url,
        userAgent: request.headers["user-agent"],
        record
      });
    } catch (e) {
      logger.error("ERROR: failed to track click: " + e);
    }

    return h.redirect(request.query.url);
  }
});

server.route({
  method: "GET",
  path: "/dank",
  handler: async () => {
    const keys = SOURCES.map(s => helpers.getKey(s, "centerfire"));
    const results = await new Promise((resolve, reject) => {
      client.mget(
        keys,
        (err, res) =>
          err ? reject(err) : resolve(res.map(r => (r ? JSON.parse(r) : null)))
      );
    });

    return results
      .reduce((final, result) => final.concat(result || []), [])
      .filter(r => r && r.price > 0 && r.calibre === "UNKNOWN")
      .sort(function(a, b) {
        if (a.price > b.price) {
          return 1;
        } else if (a.price < b.price) {
          return -1;
        } else {
          return 0;
        }
      });
  }
});

server.route({
  method: "GET",
  path: "/best-popular-prices",
  handler: () => bestPricesCache.get("centerfire")
});

function queueUpCacheRefresh(type) {
  return Promise.all(
    SOURCES.map(
      source =>
        new Promise((resolve, reject) =>
          rsmq.sendMessage(
            { qname: QUEUE_NAME, message: JSON.stringify({ source, type }) },
            (err, res) => (err ? reject(err) : resolve(res))
          )
        )
    )
  );
}

const TYPES = ["rimfire", "centerfire", "shotgun"];

server.route({
  method: "GET",
  path: "/refresh-cache",
  handler: async function(req) {
    const type = req.query.type;
    console.log(
      "secret-refresh-key",
      req.query["secret-refresh-key"],
      secretRefreshKey
    );
    logger.info({
      type: "refresh-cache",
      roundType: type,
      correctKey: req.query["secret-refresh-key"] !== secretRefreshKey
    });
    if (req.query["secret-refresh-key"] !== secretRefreshKey) {
      throw boom.badRequest("fuck off. you dont have my super secret code...");
    } else if (TYPES.indexOf(type) === -1) {
      throw boom.badRequest("invalid type: " + type);
    }

    await queueUpCacheRefresh(type);
    await bestPricesCache.drop(type);

    logger.info({ type: "cache-refresh-initd", group: type });

    return { message: "ok" };
  }
});

// Add the route
server.route({
  method: "GET",
  path: "/{type}",
  handler: async function(request) {
    const type = request.params.type;
    if (TYPES.indexOf(type) === -1) {
      throw boom.badRequest("invalid type: " + type);
    }

    let page = 1;
    if (request.query.page) {
      page = parseInt(request.query.page, 10);
    }
    if (isNaN(page) || page < 1) {
      throw boom.badRequest("invalid page: " + page);
    }

    let pageSize = 25;
    if (request.query.pageSize) {
      pageSize = parseInt(request.query.pageSize, 10);
    }
    if (isNaN(pageSize) || pageSize < 1 || page > 100) {
      throw boom.badRequest("invalid pageSize: " + pageSize);
    }

    let calibre = "";
    if (request.query.calibre) {
      calibre = request.query.calibre.toUpperCase();
    }

    let res = await classifiedListsCache.get(type);

    if (res.length === 0) {
      console.warn(`WARN: no cached results for ${type}. dropping the cat box`);
      classifiedListsCache.drop(type);
    }
    res = res.filter(r => calibre === "" || r.calibre === calibre);

    return {
      page,
      pages: Math.ceil(res.length / pageSize),
      items: res.slice((page - 1) * pageSize, page * pageSize)
    };
  }
});

server.events.on("response", function(request) {
  logger.info({
    type: "api-req",
    remoteAddress: request.info.remoteAddress,
    method: request.method.toUpperCase(),
    path: request.url.path,
    statusCode: request.response.statusCode,
    timeMs: new Date().getTime() - request.info.received
  });
  if (request.response.statusCode >= 500) {
    logger.error({
      type: "http500",
      request,
      string: `Error response (500) sent for request:  ${
        request.id
      } ${request.method.toUpperCase()} ${request.url.path} because:  ${
        request.response._error.message
      }`
    });
  }
});

async function doWork() {
  try {
    // todo: figure out way to only run this on one node when running in swarm mode
    await server.register({
      plugin: hapiCron,

      options: {
        jobs: TYPES.map((t, index) => ({
          name: "load_" + t,
          time: `0 ${index * 15} */${CACHE_REFRESH_HOURS} * * *`,
          timezone: "UTC",
          request: {
            method: "GET",
            url: `/refresh-cache?type=${t}&secret-refresh-key=${secretRefreshKey}`
          },
          onComplete: () => {
            logger.info({
              type: "refresh-cache",
              msg: `refresh ${t} has been queued up!`
            });
          }
        }))
      }
    });

    await server.start();
    logger.info({ type: "server-started", uri: server.info.uri });
  } catch (e) {
    logger.error({ type: "failed-to-stat-server", error: e.toString() });
    process.exit(1);
  }
}

doWork();
