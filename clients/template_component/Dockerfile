# base will be the the image build by the base dockerfile.
FROM base as build

WORKDIR /app/template_component
COPY . ./
RUN yarn install

RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/template_component/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]