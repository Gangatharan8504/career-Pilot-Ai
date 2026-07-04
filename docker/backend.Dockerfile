# Node.js Express Container Configuration
FROM node:20-alpine
WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install --production

# Copy application sources
COPY . .

# Expose backend service port
EXPOSE 8080

# Execute server boot command
CMD ["npm", "start"]
