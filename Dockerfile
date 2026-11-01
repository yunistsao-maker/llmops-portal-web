# syntax=docker/dockerfile:1.7
# portal-web: the portal page (static files) and the /api/* front door for the services. Kind: service.
# Build from the repo root:  docker build -t llmops/portal-web:dev .
#                       or:  tools/docker-build.sh portal-web
# Nothing is downloaded at build time (no build CA needed).
# alpine-slim: nginx and its libraries only (no curl, no extra modules): nothing here needs more
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.30-alpine-slim@sha256:5d8bb9437d74a600ec5dbf90c035451c724dc33eac8d3a71078f6f8612c345f6

FROM ${NGINX_IMAGE}
USER root
# the stock example site and server block are replaced by ours
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/snippets/ /etc/nginx/snippets/
COPY nginx/templates/ /etc/nginx/templates/
COPY --chmod=0755 nginx/15-portal-upstreams.envsh /docker-entrypoint.d/15-portal-upstreams.envsh
COPY site/ /usr/share/nginx/html/
# Upstreams: scheme://host:port only (no path). Bare names are qualified with the pod's DNS search domain at start.
ENV PORT=8080 \
    CONTENT_API_URL=http://content-api:8080 \
    ASSISTANT_API_URL=http://assistant-api:8080 \
    REQUEST_API_URL=http://request-api:8080 \
    TESTS_API_URL=http://tests-api:8080 \
    NGINX_ENVSUBST_OUTPUT_DIR=/tmp/nginx/conf.d \
    NGINX_ENVSUBST_FILTER="^(PORT|NGINX_RESOLVER|CONTENT_API_URL|ASSISTANT_API_URL|REQUEST_API_URL|TESTS_API_URL)\$" \
    NGINX_ENTRYPOINT_QUIET_LOGS=1
# the unprivileged nginx user of the base image (uid 101); files above are root-owned and read-only to it
USER 101:101
EXPOSE 8080
