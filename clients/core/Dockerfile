# base will be the the image build by the base dockerfile.
ARG IMAGE_TAG
FROM ghcr.io/ls1intum/prompt2/prompt-clients-base:${IMAGE_TAG} AS core-base

WORKDIR /app/core

ARG SERVER_HOST
ARG TEMPLATE_HOST
ARG KEYCLOAK_HOST
ARG KEYCLOAK_REALM_NAME
ARG TEMPLATE_COMPONENT_SUBDOMAIN

ENV REACT_APP_SERVER_HOST=$SERVER_HOST
ENV REACT_APP_KEYCLOAK_HOST=$KEYCLOAK_HOST
ENV REACT_APP_KEYCLOAK_REALM_NAME=$KEYCLOAK_REALM_NAME
ENV REACT_APP_TEMPLATE_HOST=$TEMPLATE_HOST
ENV REACT_TEMPLATE_COMPONENT_SUBDOMAIN=$TEMPLATE_COMPONENT_SUBDOMAIN

COPY . ./
RUN yarn install

RUN yarn build

FROM nginx:stable-alpine
COPY --from=core-base /app/core/build /usr/share/nginx/html
COPY --from=core-base /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]