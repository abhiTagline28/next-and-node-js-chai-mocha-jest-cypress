const { validationResult } = require("express-validator");
const { formatValidationError } = require("../utils/errorHandler");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedError = formatValidationError(errors.array());
    return res.status(400).json(formattedError);
  }
  next();
};

module.exports = {
  handleValidationErrors,
};
