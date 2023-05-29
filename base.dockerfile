FROM node:20-alpine3.17 as build

ENV NODE_ENV=development

WORKDIR '/var/www/app'

RUN apk add python3 make g++

COPY package*.json ./

RUN npm pkg delete scripts.prepare && npm ci

COPY . .

FROM node:20-alpine3.17 as final

WORKDIR '/var/www/app'

COPY --from=build /var/www/app/node_modules /var/www/app/node_modules 
COPY ./apps/polytlk ./apps/polytlk
COPY package*.json tsconfig.base.json ./

CMD [ "/bin/sh", "-c", "npx nx run polytlk:serve --verbose" ]