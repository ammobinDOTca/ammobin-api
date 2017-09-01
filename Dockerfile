#switch to -slim when building in conatiner
#currently linking to source folder since easier to dev...
FROM node:8-slim
RUN  apt-get update &&  apt-get install -y build-essential python
WORKDIR /build
COPY package.json /build
RUN npm install --production
COPY . /build
#VOLUME /build

EXPOSE 8080
USER node
CMD ["node","index.js"]