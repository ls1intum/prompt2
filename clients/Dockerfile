# This is the base dockerfile. Here the base image is pulled and the ras setup is done for the project.
# Make sure to include the base setup for lerna here.
FROM node:20-alpine as base
ENV YARN_VERSION 4.0.1
RUN yarn policies set-version $YARN_VERSION
WORKDIR /app
RUN yarn config set httpTimeout 300000
COPY package.json ./
COPY yarn.lock ./
COPY shared_library /app/shared_library
RUN yarn install
COPY ./lerna.json ./
