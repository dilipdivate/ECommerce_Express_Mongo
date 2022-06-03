import app from './app.js';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
  console.error(err, 'Uncaught exception throw');
  process.exit(1);
});

// Config
// if (process.env.NODE_ENV !== 'PRODUCTION') {
//   require('dotenv').config({ path: 'backend/config/config.env' });
// }

dotenv.config({ path: 'config/config.env' });

// Connecting to database
connectDatabase();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server is working on http://localhost:${PORT}`);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
