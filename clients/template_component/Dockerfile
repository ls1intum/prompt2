ARG IMAGE_TAG
FROM ghcr.io/ls1intum/prompt2/prompt-clients-base:${IMAGE_TAG} AS core-base

WORKDIR /app/template_component
COPY . ./
RUN yarn install

RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/template_component/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]