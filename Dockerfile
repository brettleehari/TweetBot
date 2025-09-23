FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install -g ts-node typescript
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the production trading service
CMD ["node", "--loader", "ts-node/esm", "src/mastra/services/production-trading-service.ts"]