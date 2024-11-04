# Use the official Node.js image
FROM node:18 AS build
WORKDIR /app

# Install dependencies
COPY FrontEnd/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY FrontEnd/ .

# Build the Angular application
RUN npm run build --prod

# Use Nginx to serve the application
FROM nginx:alpine
COPY --from=build /app/dist/frontend.client /usr/share/nginx/html
