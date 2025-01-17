#!/bin/sh
set -e

# Use envsubst to replace the placeholders with environment variables.
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js


# Execute the original CMD to start Nginx.
exec nginx -g "daemon off;"
