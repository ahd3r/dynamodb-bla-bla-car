import { v4 as uuid } from 'uuid';
import { z } from 'zod';

import { addPassengerData, createRideData, updateRideData } from '../utils/validation/ride';
import { filterAndSortByAppearance } from '../utils/utils';
import { client, DBIndexes, Entities } from './db';

export enum RideStatus {
  WAITING_PASSENGERS = 'WAITING_PASSENGERS',
  STARTING = 'STARTING',
  ON_A_WAY = 'ON_A_WAY',
  FINISH = 'FINISH'
}

export interface Ride {
  id: string; // sk
  entity: string; // pk & gsi pk
  driverId: string;
  passengers?: string;
  availablePlaces: number;
  status: RideStatus;
  carId: string;
  from: string; // lsi sk
  to: string; // lsi sk
  distanceMeters: number;
  timeMinutes: number;
  description?: string;
  created: number; // gsi sk
}

const tableName = process.env.TABLE_NAME as string;

export const getRideRepoByIds = async (ids: string[]): Promise<Ride[]> => {
  const items = await client
    .batchGet({
      RequestItems: {
        [tableName]: { Keys: ids.map((id) => ({ entity: Entities.RIDE, id })) }
      }
    })
    .promise();
  return (items?.Responses && (items.Responses[tableName] as Ride[])) || [];
};

export const getRideRepoById = async (id: string): Promise<Ride> => {
  const { Item } = await client
    .get({
      TableName: tableName,
      Key: {
        entity: Entities.RIDE,
        id: id
      }
    })
    .promise();
  return Item as Ride;
};

export const getRidesForDriverRepo = async (driverId: string): Promise<Ride[]> => {
  const { Items } = await client
    .scan({
      FilterExpression: '#driverId = :driverId',
      ExpressionAttributeNames: {
        '#driverId': 'driverId'
      },
      ExpressionAttributeValues: {
        ':driverId': driverId
      },
      TableName: tableName
    })
    .promise();
  return Items as Ride[];
};

export const getRidesForCarRepo = async (carId: string): Promise<Ride[]> => {
  const { Items } = await client
    .scan({
      FilterExpression: '#carId = :carId',
      ExpressionAttributeNames: {
        '#carId': 'carId'
      },
      ExpressionAttributeValues: {
        ':carId': carId
      },
      TableName: tableName
    })
    .promise();
  return Items as Ride[];
};

export const getRidesForTripRepo = async (to?: string, from?: string): Promise<Ride[]> => {
  const res: Ride[] = [];
  if (to) {
    const { Items: items } = await client
      .query({
        IndexName: DBIndexes.RideToIndex,
        TableName: tableName,
        KeyConditionExpression: '#entity = :entity and #to = :to',
        ExpressionAttributeValues: {
          ':entity': Entities.RIDE,
          ':to': to
        },
        ExpressionAttributeNames: {
          '#entity': 'entity',
          '#to': 'to'
        }
      })
      .promise();
    res.push(...((items as Ride[]) || []));
  }
  if (from) {
    const { Items: items } = await client
      .query({
        IndexName: DBIndexes.RideFromIndex,
        TableName: tableName,
        KeyConditionExpression: '#entity = :entity and #from = :from',
        ExpressionAttributeValues: {
          ':entity': Entities.RIDE,
          ':from': from
        },
        ExpressionAttributeNames: {
          '#entity': 'entity',
          '#from': 'from'
        }
      })
      .promise();
    res.push(...((items as Ride[]) || []));
  }
  return filterAndSortByAppearance(res);
};

export const createRideRepo = async (
  ride: z.infer<typeof createRideData> & { driverId: string }
): Promise<Ride> => {
  const rideToCreate: Ride = {
    ...ride,
    created: Date.now(),
    id: uuid(),
    entity: Entities.RIDE,
    status: RideStatus.WAITING_PASSENGERS
  };
  const { Attributes: createdEntity } = await client
    .put({
      TableName: tableName,
      Item: rideToCreate,
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return createdEntity as Ride;
};

export const updateRideRepo = async (
  id: string,
  ride: z.infer<typeof updateRideData> | z.infer<typeof addPassengerData>
): Promise<Ride> => {
  const { Attributes: updatedRide } = await client
    .put({
      TableName: tableName,
      Item: {
        ...ride,
        id,
        entity: Entities.RIDE
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return updatedRide as Ride;
};

export const deleteRideRepo = async (id: string): Promise<Ride> => {
  const { Attributes: deletedRide } = await client
    .delete({
      TableName: tableName,
      Key: {
        id,
        entity: Entities.RIDE
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return deletedRide as Ride;
};
