const pino = require('pino');

const logger = pino();

class ServerError extends Error {
  constructor(msg) {
    super(msg);
    this.type = 'ServerError';
    this.status = 500;
    this.internal = true;
  }
}

class ValidationError extends Error {
  constructor(msg) {
    if (Array.isArray(msg)) {
      super('ValidationArrayError');
      this.errors = msg;
    } else {
      super(msg);
    }
    this.type = 'ValidationError';
    this.status = 400;
    this.internal = true;
  }
}

module.exports = { logger, ValidationError, ServerError };
