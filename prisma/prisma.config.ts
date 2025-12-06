// prisma.config.ts
export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,  // direct DB connection
    },
  },
};
