FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json first for cache
COPY package*.json ./
RUN npm install

# Then copy the rest of the app
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Enable gzip and caching
COPY nginx/nginx.react.conf /etc/nginx/conf.d/default.conf

EXPOSE 80