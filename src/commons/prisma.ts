import { PrismaClient } from '@prisma/client';
import { dbConnection } from '../config/test.config';
import { config } from '../config/config';

const isTest: boolean = config.nodeEnvironment === 'test';
const prisma: PrismaClient = isTest
  ? new PrismaClient({ ...dbConnection })
  : new PrismaClient();

export default prisma;
