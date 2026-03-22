// prisma.config.ts
// This file is used by Prisma Migrate to configure the database connection.
// The datasource URL is now typically managed here or via environment variables directly.

// Ensure you have a DATABASE_URL environment variable set for your database connection.

import { defineProject } from '@prisma/cli-core';

export default defineProject({
  schema: './schema.prisma', // Path to your Prisma schema file
});
