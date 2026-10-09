const CustomError = require('../utils/CustomError');

const errorHandler = (error, request, reply) => {
  // Fastify logger
  request.log.error(error);

  let statusCode = error.statusCode || 500;
  let errorCode = error.errorCode || 'INTERNAL_SERVER_ERROR';
  let message = error.message || 'An unexpected error occurred';
  let details = error.details || null;

  // Handle Mongoose duplicate key error (E11000)
  if (error.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  // Handle Mongoose Validation Error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(error.errors || {}).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = `Invalid ID format for ${error.path}`;
  }

  // Handle Fastify schema validation error
  if (error.validation) {
    statusCode = 400;
    errorCode = 'SCHEMA_VALIDATION_ERROR';
    message = error.message;
    details = error.validation;
  }

  // Handle Zod Validation Error
  if (error.name === 'ZodError' || error.issues) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.issues || error.errors;
  }

  // Handle CORS & CSRF Origin Denials
  if (error.message && (error.message.includes('CORS blocked') || error.message.includes('CSRF'))) {
    statusCode = 403;
    errorCode = 'FORBIDDEN_ORIGIN';
    message = error.message;
  }

  reply.status(statusCode).send({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    }
  });
};

module.exports = errorHandler;
