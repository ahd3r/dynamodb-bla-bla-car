import * as jwt from 'jsonwebtoken';
import { Admin, getAdminByEmailRepo } from '../repository/admin';
import { getUserByEmailRepo, User } from '../repository/user';

import { logger, ValidationError, ServerError } from './utils';

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
  before: async ({ event }) => {
    if (!event.headers.authorization) {
      throw new ValidationError('Wrong authorization token');
    }
    let jwtData;
    try {
      jwtData = jwt.verify(event.headers.authorization, process.env.SECRET as string);
    } catch (e) {
      throw new ValidationError('Wrong jwt authorization token');
    }
    const { email, type } = jwtData;
    let user: Admin | User | undefined;
    if (type === 'admin') {
      user = await getAdminByEmailRepo(email);
    } else {
      user = await getUserByEmailRepo(email);
    }
    if (!user) {
      throw new ValidationError(`User with ${email} email doesn't exist`);
    }
    event.user = { ...user, type };
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
    const { data, error } = schema.safeParse(request.event.body);
    if (error) {
      throw new ValidationError(error.issues);
    }
    request.event.body = data;
  }
});
