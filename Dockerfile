# ── Aurex Truck Parts API ──────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# App source
COPY . .

# Uploaded images live here (mount a volume in production to persist them)
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
