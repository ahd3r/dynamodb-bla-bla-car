import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { createAdminData } from '../utils/validation/admin';
import { client, DBIndexes, Entities } from './db';

export interface Admin {
  id: string; // sk
  entity: string; // pk & gsi pk
  email: string; // lsi sk
  password: string;
  roleId: string;
  resetToken?: string;
  created: number; // gsi sk
}

const tableName = process.env.TABLE_NAME as string;

export const getAdminRepo = async (id: string): Promise<Admin> => {
  const { Item } = await client
    .get({
      TableName: tableName,
      Key: {
        id,
        entity: Entities.ADMIN
      }
    })
    .promise();
  return Item as Admin;
};

export const getAdminByEmailRepo = async (email: string): Promise<Admin | undefined> => {
  const { Items } = await client
    .query({
      TableName: tableName,
      IndexName: DBIndexes.UserAndAdminEmailIndex,
      KeyConditionExpression: '#entity = :entity and #email = :email',
      ExpressionAttributeValues: {
        ':entity': Entities.ADMIN,
        ':email': email
      },
      ExpressionAttributeNames: {
        '#entity': 'entity',
        '#email': 'email'
      }
    })
    .promise();
  if (Items?.length) {
    return Items[0] as Admin;
  }
};

export const getAdminsRepo = async (): Promise<Admin[]> => {
  const { Items } = await client.scan({ TableName: tableName }).promise();
  return Items as Admin[];
};

export const createAdminRepo = async (data: z.infer<typeof createAdminData>): Promise<Admin> => {
  const { Attributes } = await client
    .put({
      TableName: tableName,
      Item: {
        ...data,
        created: Date.now(),
        id: uuid(),
        entity: Entities.ADMIN
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return Attributes as Admin;
};

export const updateAdminRepo = async (
  id: string,
  data: {
    password?: string;
    roleId?: string;
    resetToken?: string;
  }
): Promise<Admin> => {
  const { Attributes } = await client
    .put({
      TableName: tableName,
      Item: {
        ...data,
        id,
        entity: Entities.ADMIN
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return Attributes as Admin;
};

export const deleteAdminRepo = async (id: string): Promise<Admin> => {
  const { Attributes } = await client
    .delete({
      TableName: tableName,
      Key: {
        id,
        entity: Entities.ADMIN
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return Attributes as Admin;
};
