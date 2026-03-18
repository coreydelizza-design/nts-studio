FROM node:20-slim
WORKDIR /app
COPY nts-clean/ .
RUN npm install
RUN npm run build
CMD ["node", "server.js"]
