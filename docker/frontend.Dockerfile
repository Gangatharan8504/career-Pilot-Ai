# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom nginx configuration can be injected if needed, standard default is fine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
