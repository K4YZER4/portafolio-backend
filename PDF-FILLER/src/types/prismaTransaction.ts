import type prisma from "../prisma/prisma";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export { PrismaTransactionClient };
