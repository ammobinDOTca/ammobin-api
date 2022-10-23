FROM node:16-alpine
RUN apk --no-cache add wget
WORKDIR /build
COPY package*.json /build/
RUN npm install

COPY . /build
RUN npm run build
#VOLUME /build

EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=1s CMD wget localhost:8080/api/ping -q -O/dev/null || exit 1

# todo use multi stage build to exclude devDependencies
ENV REGION=CA
ENV STAGE=PROD

# if one wants to use dynamodb
# ENV AWS_DEFAULT_REGION = "ca-central-1"
# ENV AWS_REGION = "ca-central-1"
# also provide aws sdk creds

# if one wants to use redis
# ENV REDIS_URL=redis

VOLUME [ "/build/logs" ]
CMD ["node","dist/api/api.js"]
