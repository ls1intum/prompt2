ARG IMAGE_TAG
FROM ghcr.io/ls1intum/prompt2/prompt-clients-base:${IMAGE_TAG} AS core-base


WORKDIR /app/intro_course_tutor_component
COPY . ./
RUN yarn install

RUN yarn build

# Build the final image
FROM nginx:stable-alpine

COPY --from=core-base /app/intro_course_tutor_component/build /usr/share/nginx/html
COPY --from=core-base /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]