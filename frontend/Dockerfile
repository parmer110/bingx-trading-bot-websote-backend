# Base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Run Application
RUN npm run dev

# Install a lightweight server to server the static files
RUN npm install -g serve

# Exporse the port the app runs on
EXPOSE 5173

# Command to run the app
CMD ["serve", "-s", "dist", "-l", "5173"]
