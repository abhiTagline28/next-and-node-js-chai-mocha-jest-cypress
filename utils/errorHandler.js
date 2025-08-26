// Custom API Error class
class ApiError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response formatter
const formatErrorResponse = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  return {
    success: false,
    message: error.message || "Something went wrong!",
    ...(isDevelopment && {
      error: error.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    }),
  };
};

// Validation error formatter
const formatValidationError = (errors) => {
  return {
    success: false,
    message: "Validation Error",
    errors: errors.map((error) => ({
      field: error.path || error.param, // Support both v7+ (path) and older (param)
      message: error.msg,
      value: error.value,
    })),
  };
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ApiError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ApiError(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ApiError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new ApiError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new ApiError(message, 401);
  }

  res.status(error.statusCode || 500).json(formatErrorResponse(error, req));
};

module.exports = {
  ApiError,
  formatErrorResponse,
  formatValidationError,
  asyncHandler,
  globalErrorHandler,
};
