FROM node:20.17.0-alpine3.20 as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1
RUN corepack enable

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml ./.npmrc /app/

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-optional --frozen-lockfile

COPY ./apps/web-client/src /app/src
COPY ./apps/web-client/server /app/server
COPY ./apps/web-client/babel.config.cjs ./apps/web-client/webpack.config.cjs ./apps/web-client/tsconfig.app.json ./apps/web-client/tsconfig.json ./apps/web-client/.env ./apps/web-client/.env.example .

ENTRYPOINT ["node","/app/server/index.cjs"]
