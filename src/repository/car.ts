import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { addCarData } from '../utils/validation/user';
import { client, DBIndexes, Entities } from './db';

export interface Car {
  id: string; // sk
  entity: string; // pk & gsi pk
  mark: string;
  year: string;
  number: string;
  created: number; // gsi sk
}

const tableName = process.env.TABLE_NAME as string;

export const getUsersCarsRepo = async (userId: string): Promise<Car[]> => {
  const { Items } = await client
    .query({
      IndexName: DBIndexes.CreatedIndex,
      TableName: tableName,
      KeyConditionExpression: '#entity = :entity and #created > :created',
      ExpressionAttributeValues: {
        ':entity': Entities.USER_CAR.replace('{id}', userId),
        ':created': 0
      },
      ExpressionAttributeNames: {
        '#entity': 'entity',
        '#created': 'created'
      }
    })
    .promise();
  return Items as Car[];
};

export const createCarRepo = async (
  data: z.infer<typeof addCarData>,
  userId: string
): Promise<Car> => {
  const { Attributes: createdEntity } = await client
    .put({
      TableName: tableName,
      Item: {
        ...data,
        id: uuid(),
        created: Date.now(),
        entity: Entities.USER_CAR.replace('{id}', userId)
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return createdEntity as Car;
};

export const deleteCarRepo = async (id: string, userId: string): Promise<Car> => {
  const { Attributes: deletedEntity } = await client
    .delete({
      TableName: tableName,
      Key: {
        id,
        entity: Entities.USER_CAR.replace('{id}', userId)
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return deletedEntity as Car;
};
