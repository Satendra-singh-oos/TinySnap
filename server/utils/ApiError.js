class ApiError extends Error {
  constructor(
    statusCode,
    message = "Someting Went Wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };