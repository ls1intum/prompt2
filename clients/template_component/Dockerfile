ARG IMAGE_TAG
FROM ghcr.io/ls1intum/prompt2/prompt-clients-base:${IMAGE_TAG} AS core-base

# can also be dynamically in ENV Variables
ARG SERVER_HOST
# MUST BE defined in repository env variables as it is required for the build
# ENV Variables are not available at build time
ARG TEMPLATE_COMPONENT_SUBPATH

ENV REACT_APP_SERVER_HOST=$SERVER_HOST
ENV REACT_TEMPLATE_COMPONENT_SUBPATH=$TEMPLATE_COMPONENT_SUBPATH

WORKDIR /app/template_component
COPY . ./
RUN yarn install

RUN yarn build

# Build the final image
FROM nginx:stable-alpine
# using arg to have it available at build time!
ARG TEMPLATE_COMPONENT_SUBPATH 
# Copy the build output to the subfolder, where the component shall be serving
COPY --from=core-base /app/template_component/build /usr/share/nginx/html/${TEMPLATE_COMPONENT_SUBPATH}
COPY --from=core-base /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]