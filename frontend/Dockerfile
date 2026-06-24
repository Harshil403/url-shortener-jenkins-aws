# ---------- Stage 1: Build ----------
FROM node:18-alpine AS build
 
WORKDIR /app
 
# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install
 
# Copy source and build
COPY . .
 
# Allow the backend API URL to be set at build time
# Usage: docker build --build-arg REACT_APP_API_URL=http://your-backend-url -t frontend .
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
 
RUN npm run build
 
# ---------- Stage 2: Serve ----------
FROM nginx:stable-alpine
 
# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*
 
# Copy built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html
 
EXPOSE 80
 
CMD ["nginx", "-g", "daemon off;"]
