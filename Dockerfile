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

# Start the enhanced 24/7 trading service with web dashboard
CMD ["node", "--loader", "ts-node/esm", "enhanced-24x7-trading.ts"]