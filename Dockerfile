FROM node:8-alpine
RUN apk --no-cache add wget
WORKDIR /build
COPY package.json /build
RUN npm install --production
COPY . /build
#VOLUME /build

EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=1s CMD wget localhost:8080/ping -q || exit 1
VOLUME [ "/build/logs" ]
CMD ["node","src/api/index.js"]
