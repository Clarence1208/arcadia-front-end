# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Expose port 80 to have it mapped by Docker daemon
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
