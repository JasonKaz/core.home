FROM node:alpine
WORKDIR /app/
COPY index.js package.json ./
RUN npm i
EXPOSE 4545
ENTRYPOINT ["node", "index.js"]