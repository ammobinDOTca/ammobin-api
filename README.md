# ammobin-api [![Build Status](https://travis-ci.org/ammobinDOTca/ammobin-api.svg?branch=master)](https://travis-ci.org/ammobinDOTca/ammobin-api) [![Greenkeeper badge](https://badges.greenkeeper.io/ammobinDOTca/ammobin-api.svg)](https://greenkeeper.io/)

### how to run
```docker run ammobindotca/ammobin-api -p 8080:8080```


### dev stuff
1. add
```
127.0.0.1 redis
127.0.0.1 influx
```
to /etc/hosts

2. ```docker run --rm -p 8086:8086 influxdb:alpine```
3. ```docker run --rm -p 6379:6379 redis:alpine ```

### todo
- store clicks + prices in proper db
- refactor api into separate files
- enable worker queue for pulling data

### docker hub
https://hub.docker.com/r/ammobindotca/ammobin-api/
