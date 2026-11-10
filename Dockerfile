# ENSINA A.I completo: site (versão web do app) + API num só container.
# docker build -t ensina-ai . && docker run -p 3333:3333 -v ensina-dados:/data -e ANTHROPIC_API_KEY=... ensina-ai

# 1) Gera a versão web do app
FROM node:22-alpine AS web
WORKDIR /src/mobile
COPY mobile/package*.json ./
RUN npm ci
COPY mobile/ ./
RUN CI=1 npx expo export --platform web --output-dir /web-build

# 2) Servidor
FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=web /web-build /web-build
ENV NODE_ENV=production PORT=3333 DATA_DIR=/data WEB_DIR=/web-build
VOLUME ["/data"]
EXPOSE 3333
CMD ["node", "index.js"]
