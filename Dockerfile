# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and lock file first
COPY package*.json ./

# Install dependencies including devDependencies (for Vite)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Vite app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to Nginx public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: Copy custom nginx config if you have one
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]