// src/server.ts
import app from './app';
import { prisma } from './config/database';

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();