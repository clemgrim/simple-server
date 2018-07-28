const HttpStatus = require('http-status-codes');

const handleError = (err, req, res, next) => {
  if (res.headerSent) {
    return next();
  }

  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;

  res.status(status).json({
    message: err.message,
    title: err.title || HttpStatus.getStatusText(status),
    status: status,
    code: err.code || 'unknown_error'
  });
};

class ApiError extends Error {
  constructor(message, status, code) {
    super(message);

    this.message = message;
    this.status = status;
    this.code = code;
  }
}

module.exports = {
  handleError,
  ApiError
};