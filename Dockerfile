FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies  
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the simple production trading service
CMD ["node", "simple-production-trading.js"]