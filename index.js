// TODO
/**
 * indexes
 *  global secondary index
 *  local secondary index
 * transactions
 * analytics
 *  group
 *  count
 *  sum
 *  avg
 *  min
 *  max
 *  fields
 *  sorting
 * nested object
 * relationship
 *  one to one
 *  one to many
 *  many to many
 * pagination
 * advanced filtering
 *  like
 *    start with
 *    end with
 *    consist
 *  grater then
 *  grater or equal then
 *  less then
 *  less or equal then
 *  not equal
 *  equal
 *  in
 *  not in
 *  and
 *  or
 * steams
 */
const { logger, ValidationError, ServerError } = require('./utils');

const { SECRET, TOKEN, TABLE_NAME } = process.env;

const test = async (event, context) => {
  console.log(SECRET, TOKEN, TABLE_NAME);
  logger.info({
    awsRequestId: context.awsRequestId,
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });

  try {
    if (event.headers.authorization !== process.env.SECRET) {
      throw new ValidationError('Wrong authorization token');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: 'test' })
    };
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
    };
  }
};

module.exports = { test };
