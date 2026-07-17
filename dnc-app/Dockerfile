# DNC app — single image: Node backend serving the built SPA.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm install
COPY server server
COPY web web
RUN npm run build -w server && npm run build -w web

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY server/package.json server/
RUN npm install -w server --omit=dev
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/web/dist web/dist
ENV DNC_DATA_DIR=/data \
    DNC_WEB_DIST=/app/web/dist \
    DNC_PORT=8340
VOLUME /data
EXPOSE 8340
CMD ["node", "server/dist/index.js"]
