FROM node:18 as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

RUN npm ci

RUN npm install -g @angular/cli

COPY . .

RUN ng run frontend.client:build:production

FROM nginx:latest

COPY --from=build /app/dist/frontend.client /usr/share/nginx/html

EXPOSE 8080
