import { client } from './db';

export interface Right {
  id: string; // sk
  entity: string; // pk & gsi pk
  name: string;
  created: number; // gsi sk
}

const tableName = process.env.TABLE_NAME as string;

export const getRightsRepo = async (): Promise<Right[]> => {
  const { Items } = await client.scan({ TableName: tableName }).promise();
  return Items as Right[];
};
