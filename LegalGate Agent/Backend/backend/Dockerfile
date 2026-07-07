FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY uploads/.gitkeep ./uploads/.gitkeep

EXPOSE 8080

CMD ["npm", "start"]
