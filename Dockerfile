# Step 1: Use the official Node.js image as the base image
FROM node:20.11.0-alpine

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json
COPY package.json package-lock.json ./

# Step 4: Copy .env file
COPY .env.development .env.production ./

# Step 5: Copy the rest of your application code
COPY . .

# Step 6: Install dependencies
RUN npm install

# Step 7: Build the Nest js application
RUN npm run build

# Step 8: Expose the port on which your Nest js app will run
EXPOSE 3001

# Step 9: Define the command to start the application
CMD ["npm", "start"]