FROM node:18-alpine AS base

WORKDIR /app

# Copy package.json and package-lock.json to the container  
COPY client/package*.json ./  

# Install dependencies  
RUN npm ci  

FROM base AS runner
WORKDIR /app

ENV NOVE_ENV production

# Copy the app source code to the container  
COPY client/ .  

# Build the Next.js app  
RUN npm run build  

# Expose the port the app will run on  
EXPOSE 3000  

ENV PORT 3000

# Start the app  
CMD npm start