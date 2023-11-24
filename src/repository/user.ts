import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { createUserData, updateUserData } from '../utils/validation/user';
import { client, DBIndexes, Entities } from './db';

export interface User {
  id: string; // sk
  entity: string; // pk & gsi pk
  email: string; // lsi sk
  password: string;
  phone?: string;
  rideHistory?: string;
  confirmToken?: string;
  resetToken?: string;
  created: number; // gsi sk
}

const tableName = process.env.TABLE_NAME as string;

export const getUserRepo = async (id: string): Promise<User> => {
  const { Item } = await client
    .get({
      TableName: tableName,
      Key: {
        entity: Entities.USER,
        id: id
      }
    })
    .promise();
  return Item as User;
};

export const getUserByEmailRepo = async (email: string): Promise<User | undefined> => {
  const { Items } = await client
    .query({
      IndexName: DBIndexes.UserAndAdminEmailIndex,
      TableName: tableName,
      KeyConditionExpression: '#entity = :entity and #email = :email',
      ExpressionAttributeValues: {
        ':entity': Entities.USER,
        ':email': email
      },
      ExpressionAttributeNames: {
        '#entity': 'entity',
        '#email': 'email'
      }
    })
    .promise();
  return Items && (Items[0] as User);
};

export const getAllUsersRepo = async (): Promise<User[]> => {
  const { Items } = await client.scan({ TableName: tableName }).promise();
  return Items as User[];
};

export const createUserRepo = async (user: z.infer<typeof createUserData>): Promise<User> => {
  const userToCreate: User = {
    ...user,
    created: Date.now(),
    id: uuid(),
    confirmToken: uuid(),
    entity: Entities.USER
  };
  const { Attributes: createdUser } = await client
    .put({
      TableName: tableName,
      Item: userToCreate,
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return createdUser as User;
};

export const addRideHistoryRepo = async (user: User, data: { rideId: string }[]): Promise<User> => {
  const { Attributes: updatedUser } = await client
    .put({
      TableName: tableName,
      Item: {
        id: user.id,
        entity: Entities.USER,
        rideHistory: JSON.stringify([...JSON.parse(user.rideHistory || '[]'), ...data])
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return updatedUser as User;
};

export const updateUserRepo = async (
  id: string,
  data: z.infer<typeof updateUserData> & {
    rideHistory?: string;
    password?: string;
    resetToken?: string;
    confirmToken?: string;
  }
): Promise<User> => {
  const { Attributes: updatedUser } = await client
    .put({
      TableName: tableName,
      Item: {
        id,
        entity: Entities.USER,
        ...data
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return updatedUser as User;
};
