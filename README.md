# UBH Backend

A Next.js application with Express, MongoDB, and role-based authentication.

## Features

- Next.js with TypeScript
- Express.js integration
- MongoDB database
- Role-based authentication (admin, user, moderator)
- JWT-based authentication
- Password hashing with bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user

  - Body: `{ email, password, name, role? }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`

## Role-Based Access

The application supports three roles:

- `admin`: Full access to all features
- `moderator`: Access to moderate content
- `user`: Basic access (default)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control
- Environment variables for sensitive data

## Docker Usage

### Build and Run with Docker Compose

1. **Build and start the containers:**

   ```bash
   docker-compose up --build -d
   ```

   This will build the backend image and start both the backend and MongoDB containers in detached mode.

2. **Access the backend:**
   The backend will be available at [http://localhost:8000](http://localhost:8000).

3. **View logs:**

   ```bash
   docker-compose logs app
   ```

4. **Stop the containers:**
   ```bash
   docker-compose down
   ```

### Important Docker Notes

- The backend connects to MongoDB using the internal Docker network. The connection string is set to `mongodb://mongodb:27017/ubh-db` in the Docker Compose file.
- Data for MongoDB is persisted in a Docker volume named `mongodb_data`.
- The `.env` file is copied into the container. For production, consider using Docker secrets or environment variables instead of copying sensitive files.
- If you change dependencies or code, rebuild the image with:
  ```bash
  docker-compose build
  ```
- To run only the backend (without MongoDB), you can use:
  ```bash
  docker build -t ubh-backend .
  docker run -p 8000:8000 --env-file .env ubh-backend
  ```
  Make sure to update your `.env` to point to an accessible MongoDB instance.

## Database Migrations

This project uses [migrate-mongo](https://github.com/seppevs/migrate-mongo) for MongoDB migrations.

### Setup

- The migration system is already initialized.
- MongoDB connection details are read from your `.env` file (`MONGODB_URI` and `MONGODB_DB`).

### Running Migrations

- To apply all pending migrations:
  ```bash
  npm run migrate:mongo:up
  ```
- To rollback the last migration:
  ```bash
  npm run migrate:mongo:down
  ```
- To create a new migration file:
  ```bash
  npm run migrate:mongo:create -- your-migration-name
  ```
  This will create a new file in the `migrations/` directory. Edit the `up` and `down` functions to define your migration logic.

### Example Migration

See `migrations/20250619111651-example-add-field-to-users.js` for a sample migration that adds a field to all users.
