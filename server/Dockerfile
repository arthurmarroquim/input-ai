# Servidor do ENSINA A.I (Tutor IA, login, progresso e vídeos)
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production PORT=3333 DATA_DIR=/data
# /data guarda usuários, progresso e uso do Tutor: monte um volume/disco persistente aqui.
VOLUME ["/data"]
EXPOSE 3333
CMD ["node", "index.js"]
