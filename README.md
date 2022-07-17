# ammobin-api [ ![Codeship Status for ammobinDOTca/ammobin-api](https://app.codeship.com/projects/11229ef0-d3e6-0135-b59a-12b6e6b26eee/status?branch=master)](https://app.codeship.com/projects/262911) [![Greenkeeper badge](https://badges.greenkeeper.io/ammobinDOTca/ammobin-api.svg)](https://greenkeeper.io/) [![docker pulls](https://img.shields.io/docker/pulls/ammobindotca/ammobin-api.svg)](https://hub.docker.com/r/ammobindotca/ammobin-api 'DockerHub')

### how to run

`docker run ammobindotca/ammobin-api -p 8080:8080`

### dev stuff

do normal nodejs dev stuff

- install nvm
- install docker
- run ``nvm use```

1. add

```
127.0.0.1 redis
127.0.0.1 rendertron
```

to /etc/hosts (server + worker expect redis to be available at the host 'redis')

2. `docker-compose run -d`
3. `npm run dev` for webserver
4. `npm run dev-worker` for scrape worker

### todo

make redis url configurable
make logging more configurable
crash server when unable to access fluentd
add a few unit tests
add stricter types + move into common package for use with client ?
refactor vendor info into single location
clean up vendor urls
refactor lambda and docker stuff into shared logic

### docker hub

https://hub.docker.com/r/ammobindotca/ammobin-api/



# how to verify scrapes
URL=wolverinesupplies.com TYPE=rimfire npx ts-node src/random/test.ts 
