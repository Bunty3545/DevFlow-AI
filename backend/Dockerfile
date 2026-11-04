# Backend Dockerfile for InfraWatch AI
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "dist/server.js"]

