import { z } from "zod/v4";
import { env } from "hono/adapter";
import type { Context } from "hono";

const EnvSchema = z.object({
  MERGEABLE_GITHUB_CLIENT_ID: z.string().nonempty(),
  MERGEABLE_GITHUB_CLIENT_SECRET: z.string().nonempty(),
  DATABASE_URL: z.string().nonempty(),
  MERGEABLE_APP_URL: z.string().nonempty(),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * @param c Hono context
 * @returns Environment variables
 */
export function environ(c: Context): Env {
  return EnvSchema.parse(env<Env>(c));
}
