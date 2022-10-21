const { logger, ValidationError, ServerError } = require('./utils');

const logReq = {
  before: ({ event, context }) => {
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

const logRes = {
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

const defineJSONResponse = {
  after: ({ response }) => {
    response.headers = {
      'Content-Type': 'application/json'
    };
    response.body = JSON.stringify(response.body);
  }
};

const checkAuthorization = {
  before: ({ event }) => {
    if (event.headers.authorization !== process.env.SECRET) {
      throw new ValidationError('Wrong authorization token');
    }
  }
};

const errorHandler = {
  onError: ({ error, response }) => {
    console.log('errorHandler 123321123321');
    console.log(response);
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    response = {
      statusCode: error.status,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
    };
  }
};

module.exports = { logReq, checkAuthorization, errorHandler, logRes, defineJSONResponse };
