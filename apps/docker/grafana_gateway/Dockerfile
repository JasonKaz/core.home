FROM node:alpine
WORKDIR /app/
COPY index.js package.json ./
RUN npm i
ENTRYPOINT ["node", "index.js"]
