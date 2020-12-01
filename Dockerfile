FROM node:lts-alpine
LABEL maintainer JOTA <juniors@jota.one>

ARG NODE_ENV=production

RUN apk update && apk upgrade

COPY package*.json ./
RUN npm ci --only=production

COPY LICENCE.md .
COPY ./app ./app
COPY ./bin ./bin
COPY ./cmd ./cmd

RUN mkdir /data

ENTRYPOINT [ "npm", "run", "serve", "--", "-r", "/data"]