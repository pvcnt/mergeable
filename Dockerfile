# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the container at /app
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Make port 3000 available to the world outside this container
RUN npm run build

FROM nginx:1.23.0-alpine

# Copy the build output to replace the default nginx contents.
COPY --from=0 /app/dist /usr/share/nginx/html

