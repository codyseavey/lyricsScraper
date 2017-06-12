FROM node:4.4.6

ADD app lyrics
WORKDIR /lyrics/
RUN npm install

EXPOSE 8080
CMD npm start
