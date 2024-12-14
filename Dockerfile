FROM node:22 AS build
WORKDIR /opt/app

ADD . .

RUN npm ci --legacy-peer-deps

RUN npm run migrate:generate
RUN npm run build --omit=dev

RUN apt-get update && apt-get install -y curl unzip

RUN curl -L https://github.com/remnawave/frontend/releases/latest/download/remnawave-frontend.zip -o frontend.zip

RUN unzip frontend.zip -d frontend_temp
RUN mkdir frontend
RUN cp -r frontend_temp/dist/* frontend/
RUN rm -rf frontend_temp frontend.zip

FROM node:22
WORKDIR /opt/app
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/frontend ./frontend
COPY ./configs /var/lib/remnawave/configs
ADD *.json ./
ADD ./prisma ./prisma
ADD ./libs ./libs


WORKDIR /opt/app

RUN npm ci --omit=dev --legacy-peer-deps
RUN npm run migrate:generate
CMD [ "npm", "run", "prod:deploy" ]