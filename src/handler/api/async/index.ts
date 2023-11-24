import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { Lambda } from 'aws-sdk';

import { errorHandler, logReq, logRes, validateBody } from '../../../utils/middleware';

export const calculateFibonacci = middy(
  async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const lambda = new Lambda();
    lambda.config.region = process.env.REGION;
    lambda.invoke({ FunctionName: 'calculateFibonacciStandalone', Payload: JSON.stringify({}) });
    return {
      statusCode: 100,
      body: ''
    };
  }
)
  .use(jsonBodyParser())
  .use(logReq)
  .use(validateBody())
  .use(logRes)
  .use(errorHandler);
