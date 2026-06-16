# ==========================================
# Stage 1: Install Dependencies and Build App
# ==========================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install absolute freeze-locked dependencies
RUN npm ci

# Copy full React structural files
COPY . .

# Run compilation step to produce Static SPA in /app/dist
RUN npm run build

# ==========================================
# Stage 2: Serve compiled assets using Nginx
# ==========================================
FROM nginx:stable-alpine

# Copy built SPA files into Nginx public route root
COPY --from=build /app/dist /usr/share/nginx/html

# Replace standard default virtual host config with custom rewrite reverse proxy
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
