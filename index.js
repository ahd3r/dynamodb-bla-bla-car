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
const middy = require('@middy/core');
const jsonBodyParser = require('@middy/http-json-body-parser');
const validator = require('@middy/validator');

const {
  logReq,
  logRes,
  errorHandler,
  defineJSONResponse,
  checkAuthorization
} = require('./middleware');

const { SECRET, TOKEN, TABLE_NAME } = process.env;

const getRides = middy(async (event, context) => {
  return {
    statusCode: 200,
    body: { data: 'getRides' }
  };
})
  .use(logReq)
  .use(defineJSONResponse)
  .use(logRes)
  .use(errorHandler);

const createRide = middy(async (event, context) => {
  return {
    statusCode: 201,
    body: { data: 'createRide' }
  };
})
  .use(jsonBodyParser())
  .use(logReq)
  .use(checkAuthorization)
  .use(
    validator({
      inputSchema: {
        type: 'object',
        properties: {
          body: {
            type: 'object',
            properties: {
              fname: { type: 'string' },
              lname: { type: 'string' },
              prename: { type: 'string' }
            },
            required: ['fname', 'lname']
          }
        },
        required: ['body']
      }
    })
  )
  .use(errorHandler)
  .use(defineJSONResponse)
  .use(logRes);

module.exports = { getRides, createRide };
