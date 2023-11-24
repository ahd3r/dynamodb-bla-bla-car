import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const client = new DocumentClient({ region: 'us-east-1', apiVersion: '2012-08-10' });

export enum DBIndexes {
  CreatedIndex = 'CreatedIndex', // global
  UserAndAdminEmailIndex = 'UserAndAdminEmailIndex', // local
  RideToIndex = 'RideToIndex', // local
  RideFromIndex = 'RideFromIndex', // local
  AdminChatIndex = 'AdminChatIndex' // local
}

export enum Entities {
  USER = 'USER',
  USER_CAR = 'USER{id}#CAR',
  RIDE = 'RIDE',
  RIDE_TRANSACTION = 'RIDE#TRANSACTION',
  RIDE_CHAT = 'RIDE{id}#CHAT',
  RIDE_CHAT_MESSAGE = 'RIDE{id}#CHAT#MESSAGE',
  ADMIN = 'ADMIN',
  ROLE = 'ROLE',
  RIGHT = 'RIGHT',
  CHAT = 'CHAT',
  CHAT_MESSAGE = 'CHAT{id}#MESSAGE'
}
