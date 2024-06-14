# Use an official Node runtime as a parent image
FROM node:20 as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Construisez l'application
RUN npm run build

# Étape de production
FROM nginx:stable-alpine as production-stage

# Copiez le build du dossier dist dans le serveur nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copiez le fichier de configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exposez le port 80
EXPOSE 8080

# Lancez nginx
CMD ["nginx", "-g", "daemon off;"]