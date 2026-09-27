# ==========================================
# Stage 1: Build the Angular SPA Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install npm dependencies
RUN npm ci

# Copy all project source code
COPY . .

# Build production bundle (Angular 19 output in dist/demo/browser)
RUN npm run build

# ==========================================
# Stage 2: Serve using lightweight Nginx
# ==========================================
FROM nginx:alpine

# Clean default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled Angular distribution from build stage
COPY --from=build /app/dist/demo/browser /usr/share/nginx/html

# Expose standard web container port
EXPOSE 80

# Start Nginx web server
CMD ["nginx", "-g", "daemon off;"]
