# Use Node.js 20 base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start command (using dev script with vite)
# Use --host to make it accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
