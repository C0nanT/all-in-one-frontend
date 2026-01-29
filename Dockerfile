FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# ------- build stage -------
FROM base AS build

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ------- production stage -------
FROM nginx:stable-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
