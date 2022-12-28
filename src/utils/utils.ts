import pino from 'pino';

export const logger = pino();

export class ServerError extends Error {
  public type = 'ServerError';
  public status = 500;
  public internal = true;

  constructor(msg) {
    super(msg);
  }
}

export class ValidationError extends Error {
  public type = 'ValidationError';
  public status = 400;
  public internal = true;
  public errors: string[];

  constructor(msg) {
    super(Array.isArray(msg) ? 'ValidationArrayError' : msg);
    if (Array.isArray(msg)) {
      this.errors = msg;
    }
  }
}
