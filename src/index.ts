// TODO
/** DB
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
/** IMPLEMENTATION
 * realtime (event bridge)
 * realtime (api gateway (websocket))
 * (no server approach)
 */
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

import {
  logReq,
  logRes,
  errorHandler,
  defineJSONResponse,
  checkAuthorization,
  validateBody
} from './middleware';
import { createRideRepo } from './repository/ride';
import { createRideData } from './utils/ride-validator';

export const getAdmin = middy();
export const getAdmins = middy();
export const updateAdmin = middy();
export const createAdmin = middy();
export const deleteAdmin = middy();

export const getRoles = middy();
export const createRole = middy();
export const updateRole = middy();
export const deleteRole = middy();

export const getRights = middy();

export const getUser = middy();
export const getUsers = middy();
export const updateUser = middy();
export const createUser = middy();

export const createCar = middy();
export const deleteCar = middy();
export const getUserCars = middy();
export const changeUserCars = middy();

export const buyPlace = middy();
export const refund = middy();

export const getChat = middy();
export const createChat = middy();
export const sendMessage = middy();

export const getRides = middy();
export const getRide = middy();
export const addPassengerToRide = middy();
export const updateRide = middy();
export const createRide = middy(
  async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const dataToCreateRide: any = event.body;
    const res: any = await createRideRepo(dataToCreateRide);
    return {
      statusCode: 201,
      body: res
    };
  }
)
  .use(jsonBodyParser())
  .use(logReq)
  .use(checkAuthorization)
  .use(validateBody(createRideData))
  .use(defineJSONResponse)
  .use(logRes)
  .use(errorHandler);
