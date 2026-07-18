# LOLES

<p align="center">
  <a href="#website"><img src="https://img.shields.io/badge/WEBSITE-e04e39?style=for-the-badge" alt="Website" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/FEATURES-dfb317?style=for-the-badge" alt="Features" /></a>
  <a href="#technologies"><img src="https://img.shields.io/badge/TECHNOLOGIES-9400d3?style=for-the-badge" alt="Technologies" /></a>
  <a href="#setup"><img src="https://img.shields.io/badge/SETUP-0082c8?style=for-the-badge" alt="Setup" /></a>
  <a href="#contributing"><img src="https://img.shields.io/badge/CONTRIBUTING-7fb800?style=for-the-badge" alt="Contributing" /></a>
</p>

## Website

## Features

## Technologies

## Setup

To set up the application locally, you will need to use Docker and Docker Compose. The application uses a PostgreSQL database and a Next.js frontend/backend with Prisma.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js (if running the Next.js app outside of Docker)

### Running with Docker Compose (Recommended)

The easiest way to start the application and the database is using Docker Compose.

1. **Environment Variables**
   Create a `.env` file in the root directory containing necessary environment variables for Postgres and Prisma. For example:
   ```env
   # Ensure you set these correctly based on your database configuration
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_DB=loles
   DATABASE_URL=postgresql://postgres:password@db:5432/loles?schema=public
   ```

2. **Start the Containers**
   ```bash
   docker compose up -d --build
   ```
   This command will:
   - Start a PostgreSQL 15 database on port `5434` on your host.
   - Build the Next.js application container.
   - Run `npx prisma db push` to synchronize the database schema before starting the app.
   - Start the Next.js application on port `3055` on your host.

3. **Access the Application**
   Once the containers are up, the application will be available at:
   [http://localhost:3055](http://localhost:3055)

### Running Locally (Without App Container)

If you want to run the Next.js development server locally while using Docker only for the database:

1. **Start the Database**
   ```bash
   docker compose up db -d
   ```
   *Note: This maps the database to port `5434` locally.*

2. **Configure Environment Variables**
   Update your local `.env` file to connect to the database via localhost on the mapped port:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5434/loles?schema=public
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Synchronize Prisma Schema & Generate Client**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The local application will be available at [http://localhost:3000](http://localhost:3000).

## Contributing
