import { z } from "zod";

const EnvSchema = z.object({
  MERGEABLE_GITHUB_URLS: z.string().optional(),
  MERGEABLE_PR_SIZES: z.string().optional(),
  MERGEABLE_NO_TELEMETRY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
