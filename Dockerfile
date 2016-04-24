FROM node:5.10

MAINTAINER Van-Duyet Le <me@duyetdev.com>

RUN mkdir -p /usr/app/src

WORKDIR /usr/app
COPY . /usr/app

EXPOSE 5000

RUN npm install
CMD ["npm", "start"]
