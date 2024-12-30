FROM node:22-bookworm-slim AS build
WORKDIR /opt/app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run migrate:generate
RUN npm run build

RUN apt-get update && apt-get install -y curl unzip \
    && curl -L https://github.com/remnawave/frontend/releases/latest/download/remnawave-frontend.zip -o frontend.zip \
    && unzip frontend.zip -d frontend_temp \
    && mkdir frontend \
    && cp -r frontend_temp/dist/* frontend/ \
    && rm -rf frontend_temp frontend.zip \
    && apt-get remove -y curl unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

FROM node:22-bookworm-slim
WORKDIR /opt/app

COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/frontend ./frontend
COPY --from=build /opt/app/prisma ./prisma

COPY configs /var/lib/remnawave/configs
COPY package*.json ./
COPY libs ./libs

RUN npm ci --omit=dev --legacy-peer-deps \
    && npm run migrate:generate \
    && npm cache clean --force

CMD [ "npm", "run", "prod:deploy" ]