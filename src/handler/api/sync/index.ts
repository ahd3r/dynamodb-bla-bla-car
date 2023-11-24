import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { z } from 'zod';

import {
  logReq,
  logRes,
  errorHandler,
  defineJSONResponse,
  checkAuthorization,
  validateBody
} from '../../../utils/middleware';
import { createRideRepo } from '../../../repository/ride';
import { createRideData } from '../../../utils/validation/ride';
import { User } from '../../../repository/user';

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
    const dataToCreateRide: z.infer<typeof createRideData> = event.body as any;
    const authUser: User = (event as any).user;
    const res: any = await createRideRepo({ ...dataToCreateRide, driverId: authUser.id });
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
