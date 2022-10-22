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
const Joi = require('joi');

const {
  logReq,
  logRes,
  errorHandler,
  defineJSONResponse,
  checkAuthorization,
  validateBody
} = require('./middleware');
const { logger } = require('./utils');

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
    validateBody(
      Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        name: Joi.string().optional()
      })
    )
  )
  .use(defineJSONResponse)
  .use(logRes)
  .use(errorHandler);

module.exports = { getRides, createRide };
