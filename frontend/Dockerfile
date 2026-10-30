# Stage 1: build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build arguments for env variables
ARG VITE_API_BASE_URL

# This line passes an env variable into the docker container so the react app knows
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# npm run build for production and dev for development
RUN npm run build

# Stage 2: Nginx - 
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;"]