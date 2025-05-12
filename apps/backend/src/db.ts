import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";
import { PrismaClient } from "../generated/prisma";
import { type Env } from "./env";

export function getPrismaClient(env: Env): PrismaClient {
  let adapter: PrismaNeon | PrismaPg;
  if (env.DATABASE_URL.indexOf("neon.tech") > -1) {
    neonConfig.webSocketConstructor = ws;
    neonConfig.poolQueryViaFetch = true;
    adapter = new PrismaNeon({ connectionString: `${env.DATABASE_URL}` });
  } else {
    adapter = new PrismaPg({ connectionString: `${env.DATABASE_URL}` });
  }
  return new PrismaClient({ adapter });
}

export type { User } from "../generated/prisma";
