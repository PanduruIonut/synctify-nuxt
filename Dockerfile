FROM node:18-slim

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Fix: symlink public folder to where nitro expects it
RUN mkdir -p /app/.output/server/chunks && ln -s /app/.output/public /app/.output/server/chunks/public

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
