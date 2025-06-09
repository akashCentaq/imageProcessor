Node.js Backend with TypeScript, Express, Prisma, and OAuth 2.0
This is a backend server built with Node.js, TypeScript, Express, PostgreSQL (via Prisma), and Google OAuth 2.0 for authentication, following an MVC structure.
Prerequisites

Node.js (v18 or higher)
PostgreSQL (running locally or hosted)
Google Cloud Console project with OAuth 2.0 credentials

Setup Instructions

Clone the repository:
git clone <repository-url>
cd project-root


Install dependencies:
npm install


Set up environment variables:

Create a .env file in the root directory based on the example below:PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
SESSION_SECRET="your-session-secret"




Set up Prisma:

Initialize the database and apply migrations:npx prisma migrate dev --name init




Run the server:

For development (with auto-restart):npm run dev


For production:npm run build
npm start





API Endpoints

GET /auth/google: Initiate Google OAuth 2.0 login
GET /auth/google/callback: Handle Google OAuth callback
GET /auth/logout: Log out the user
GET /users/profile: Get the authenticated user's profile (protected route)

Project Structure

src/config/: Database and OAuth configurations
src/controllers/: Request handlers
src/middleware/: Authentication middleware
src/models/: Prisma schema and database models
src/routes/: Express route definitions
src/services/: Business logic
src/types/: TypeScript type definitions

