# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose port 3000 to access the frontend
EXPOSE 3000

# Run the Next.js application in production mode
CMD ["npm", "start"]
