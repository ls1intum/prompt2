# base will be the the image build by the base dockerfile.
FROM base as build

# Here the dependencies will be installed and the local required packages bootstrapped.
# The --slim flag will cause the package json to only include the dependencies, so not all changes to the package json cause docker to reinstall all packages.
WORKDIR /app/core
COPY . ./
RUN yarn install
# The normal package.json should be copied after the install into the container

# This will only add the command to the dockerfile if the build script exists in the package otherwise its ignored.
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/core/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]