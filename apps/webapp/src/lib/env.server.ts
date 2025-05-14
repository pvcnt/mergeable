import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  MERGEABLE_GITHUB_URLS: z.string().optional(),
  // https://github.com/kubernetes-sigs/prow/blob/main/pkg/plugins/size/size.go
  MERGEABLE_PR_SIZES: z.string().nonempty().default("10,30,100,500,1000"),
  MERGEABLE_NO_TELEMETRY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
