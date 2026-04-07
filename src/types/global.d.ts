import { PrismaClient } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface Global {
      db: PrismaClient;
      batchs: any[];
      timestamp: number;
    }
  }

  var db: PrismaClient;
  var batchs: any[];
  var timestamp: number;
}

export { };
