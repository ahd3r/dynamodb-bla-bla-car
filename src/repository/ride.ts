import { PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { v4 as uuid } from 'uuid';

import { client, Entities } from './db';
import { logger } from '../utils/utils';

export enum RideStatus {
  WAITING_PASSENGERS = 'WAITING_PASSENGERS',
  STARTING = 'STARTING',
  ON_A_WAY = 'ON_A_WAY',
  FINISH = 'FINISH'
}

export interface Ride {
  id: string; // sk
  entity: string; // pk
  driverId: string;
  passengers?: string;
  availablePlaces: number;
  status: RideStatus;
  carId: string;
  from: string;
  to: string;
  distanceMeters: number;
  timeMinutes: number;
  description?: string;
  created: number;
}

const tableName = process.env.TABLE_NAME as string;

export const createRideRepo = async (
  ride: Omit<Ride, 'id' | 'entity' | 'created' | 'passengers' | 'status'>
): Promise<Ride> => {
  const createdRideEntity: Ride = {
    ...ride,
    created: Date.now(),
    id: uuid(),
    entity: Entities.RIDE,
    status: RideStatus.WAITING_PASSENGERS
  };
  await client
    .put({
      TableName: tableName,
      Item: createdRideEntity
    })
    .promise();
  return createdRideEntity;
};

export const updateRideRepo = () => {};

export const getRideRepo = () => {};

export const getAllRidesRepo = () => {};

export const deleteRideRepo = () => {};
