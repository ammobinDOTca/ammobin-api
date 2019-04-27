FROM node:12-alpine
RUN apk --no-cache add wget
WORKDIR /build
COPY package*.json /build/
RUN npm install

COPY . /build
RUN npm run build
#VOLUME /build

EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=1s CMD wget localhost:8080/ping -q -O/dev/null || exit 1
VOLUME [ "/build/logs" ]
CMD ["node","dist/api/index.js"]
