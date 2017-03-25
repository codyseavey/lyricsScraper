FROM node:4.4.6

ADD app lyrics
WORKDIR /lyrics/
RUN npm install express
RUN npm install cheerio
RUN npm install request
RUN npm install async

EXPOSE 8080
CMD node server.js
