import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { client, Entities } from './db';
import { createRoleData, updateRoleData } from '../utils/validation/role';

export interface Role {
  id: string; // sk
  entity: string; // pk & gsi pk
  name: string;
  rights: string;
  created: number; // gsi sk
}

const tableName = process.env.TABLE_NAME as string;

export const getRolesRepo = async (): Promise<Role[]> => {
  const { Items } = await client.scan({ TableName: tableName }).promise();
  return Items as Role[];
};

export const createRoleRepo = async (data: z.infer<typeof createRoleData>): Promise<Role> => {
  const { Attributes: createdRole } = await client
    .put({
      TableName: tableName,
      Item: {
        id: uuid(),
        entity: Entities.ROLE,
        created: Date.now(),
        rights: JSON.stringify(data.rights),
        name: data.name
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return createdRole as Role;
};

export const updateRoleRepo = async (
  id: string,
  data: z.infer<typeof updateRoleData>
): Promise<Role> => {
  const dataRoleToUpdate: any = data;
  if (dataRoleToUpdate.rights) {
    dataRoleToUpdate.rights = JSON.stringify(dataRoleToUpdate.rights);
  }
  const { Attributes: createdRole } = await client
    .put({
      TableName: tableName,
      Item: {
        id,
        entity: Entities.ROLE,
        ...dataRoleToUpdate
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return createdRole as Role;
};

export const deleteRoleRepo = async (id: string): Promise<Role> => {
  const { Attributes: deletedEntity } = await client
    .delete({
      TableName: tableName,
      Key: {
        id,
        entity: Entities.ROLE
      },
      ReturnValues: 'ALL_OLD'
    })
    .promise();
  return deletedEntity as Role;
};
