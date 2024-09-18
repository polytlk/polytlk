FROM node:20.16.0-alpine3.20 as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1
ENV NX_DAEMON=false
RUN corepack enable

WORKDIR /polytlk

COPY ./package.json ./pnpm-lock.yaml ./project.json ./nx.json ./.npmrc tsconfig.base.json babel.config.js /polytlk/

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-optional --frozen-lockfile

COPY ./apps/web-client/ /polytlk/apps/web-client/
COPY ./libs/xstate/ /polytlk/libs/xstate/

ENTRYPOINT ["pnpm","nx", "run", "web-client:serve:development"]
