FROM node:22-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies like typescript) so Prisma CLI works perfectly
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Start the application
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# The startup command is defined in docker-compose.yml 
# (npx prisma db push && npm start)
CMD ["npm", "start"]
