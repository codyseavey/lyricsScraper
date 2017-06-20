FROM node:latest

ADD app lyrics
WORKDIR /lyrics/
RUN npm install

EXPOSE 8080
CMD npm start
