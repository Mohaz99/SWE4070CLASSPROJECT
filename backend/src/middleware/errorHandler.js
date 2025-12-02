// Centralized Express error handler
// Ensures all thrown/rejected errors are returned in a consistent JSON shape

module.exports = (err, req, res, next) => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Basic error payload
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include additional details when useful and safe
  if (err.code === 11000) {
    // Mongo duplicate key error
    payload.message = 'Duplicate value detected';
    payload.details = err.keyValue;
  }

  // Validation errors (e.g., Mongoose)
  if (err.name === 'ValidationError') {
    payload.message = 'Validation error';
    payload.errors = Object.values(err.errors || {}).map((e) => e.message);
  }

  // Only expose stack in non-production for debugging
  if (!isProd && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};




