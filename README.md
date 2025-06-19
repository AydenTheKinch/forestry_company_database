# Forestry Company Database

A web application for managing forestry contractor information.

## Environment Setup

This project uses environment variables for configuration. Example files are provided as templates.

### Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and update the values as needed

### Client Setup

1. Navigate to the client directory:
```bash
cd client
```

2. For development, copy the example to `.env.development`:
```bash
cp .env.example .env.development
```

3. For production, copy the example to `.env.production`:
```bash
cp .env.example .env.production
```

4. Edit the environment files and update the values as needed

## Development

1. Start the server:
```bash
cd server
npm install
npm run dev
```

2. Start the client:
```bash
cd client
npm install
npm start
```

## Production

The application is configured for deployment on Render. See deployment documentation for details.
