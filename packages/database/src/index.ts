import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Driver adapter instead of Prisma's binary query engine - see the comment
// on the `client` generator in prisma/schema.prisma for why.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
export * from '@prisma/client';
