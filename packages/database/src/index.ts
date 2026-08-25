import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

// RDS (and most managed Postgres hosts) only accept `hostssl` connections -
// there's no plain `host` rule in their pg_hba.conf at all, so a non-SSL
// connection attempt gets rejected outright, not just with a warning. `pg`
// doesn't enable SSL by default. `rejectUnauthorized: false` skips CA
// verification (fine for this - RDS presents an Amazon-issued cert we don't
// bundle a trust chain for) while still encrypting the connection, which is
// all pg_hba.conf's `hostssl` rule requires. Local/VPS Postgres on localhost
// isn't behind that requirement, so leave it unset there.
const isLocalDb = connectionString ? /(localhost|127\.0\.0\.1)/.test(connectionString) : true;

// Driver adapter instead of Prisma's binary query engine - see the comment
// on the `client` generator in prisma/schema.prisma for why.
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});

export const prisma = new PrismaClient({ adapter });
export * from '@prisma/client';
