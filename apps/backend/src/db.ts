import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import type { Env } from "./env";
import { PrismaNeon } from "@prisma/adapter-neon";

export function getPrismaClient(env: Env): PrismaClient {
  let adapter: PrismaNeon | PrismaPg;
  if (env.DATABASE_URL.indexOf("neon.tech") > -1) {
    adapter = new PrismaNeon({ connectionString: `${env.DATABASE_URL}` });
  } else {
    adapter = new PrismaPg({ connectionString: `${env.DATABASE_URL}` });
  }
  return new PrismaClient({ adapter });
}

export type { User } from "../generated/prisma";
