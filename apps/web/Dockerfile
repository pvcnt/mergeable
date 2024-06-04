FROM node:20

WORKDIR /app

ARG VITE_COMMIT_SHA=
ENV VITE_COMMIT_SHA=$VITE_COMMIT_SHA

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.23.0-alpine

COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80