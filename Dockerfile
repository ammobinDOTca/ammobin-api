#switch to -slim when building in conatiner
#currently linking to source folder since easier to dev...
FROM node:8-slim
RUN  apt-get update &&  apt-get install -y build-essential python
ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /build
COPY package.json /build
RUN npm install --production
COPY . /build


EXPOSE 8080
USER node
CMD ["dumb-init","node","index.js"]