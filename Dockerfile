FROM node:20-alpine
WORKDIR /app

# Copy package files and install ALL dependencies (including tsx from devDeps)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Cloud Run sets PORT=8080 automatically
EXPOSE 8080

# Run the TypeScript server directly using tsx
CMD ["npx", "tsx", "server.ts"]
