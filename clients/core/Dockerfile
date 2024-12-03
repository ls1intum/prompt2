# base will be the the image build by the base dockerfile.
FROM ghcr.io/ls1intum/prompt2/prompt-clients-base:latest as build

WORKDIR /app/core
COPY . ./
RUN yarn install

RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/core/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]