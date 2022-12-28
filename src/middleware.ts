import { logger, ValidationError, ServerError } from './utils/utils';

export const logReq = {
  before: ({ event, context }: any) => {
    logger.info({
      type: 'request',
      awsRequestId: context.awsRequestId,
      method: event.requestContext.http.method,
      queryStringParameters: event.queryStringParameters,
      pathParameters: event.pathParameters,
      body: event.body,
      headers: event.headers,
      path: event.requestContext.http.path
    });
  }
};

export const logRes = {
  after: ({ event, context, response }) => {
    logger.info({
      type: 'response',
      awsRequestId: context.awsRequestId,
      method: event.requestContext.http.method,
      path: event.requestContext.http.path,
      responseBody: response.body
    });
  }
};

export const defineJSONResponse = {
  after: ({ response }) => {
    response.headers = {
      'Content-Type': 'application/json'
    };
    response.body = JSON.stringify(response.body);
  }
};

export const checkAuthorization = {
  before: ({ event }) => {
    if (event.headers.authorization !== process.env.SECRET) {
      throw new ValidationError('Wrong authorization token');
    }
  }
};

export const errorHandler = {
  onError: (request) => {
    logger.error(request.error);
    if (!request.error.internal) {
      if (request.error.cause) {
        request.error = new ValidationError(request.error.cause);
      } else {
        request.error = new ServerError(request.error.message || request.error);
      }
    }
    request.response = {
      statusCode: request.error.status,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: request.error.message,
        type: request.error.type,
        errors: request.error.errors
      })
    };
    logger.info({
      type: 'response',
      awsRequestId: request.context.awsRequestId,
      method: request.event.requestContext.http.method,
      path: request.event.requestContext.http.path,
      responseBody: JSON.parse(request.response.body)
    });
  }
};

export const validateBody = (schema) => ({
  before: (request) => {
    request.event.body = request.event.body || {};
    const { value, error } = schema.validate({ abortEarly: false });
    if (error) {
      throw new ValidationError(error.details);
    }
    request.event.body = value;
  }
});
