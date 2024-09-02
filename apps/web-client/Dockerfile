FROM node:20.16.0-alpine3.20 as build-stage
WORKDIR /app

RUN npm i -D @import-meta-env/cli

RUN echo '{ "main": "node_modules/@import-meta-env/cli/bin/import-meta-env.js", "output": "sea-prep.blob" }' > sea-config.json

RUN node --experimental-sea-config sea-config.json
RUN cp $(command -v node) import-meta-env-alpine
RUN npx postject import-meta-env-alpine NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

FROM docker.io/nginx:stable-alpine

RUN mkdir /app

COPY --from=build-stage /app/import-meta-env-alpine /app/

COPY dist/apps/web-client/* /usr/share/nginx/html/
COPY apps/web-client/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY apps/web-client/.env.example ./app/
COPY apps/web-client/scripts/start.sh ./app/

ENTRYPOINT ["sh","/app/start.sh"]
