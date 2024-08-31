import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { HTTPException } from "hono/http-exception";
import * as dbSchema from "./db/schema";

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return c.json({ ok: false, message: err.toString() }, 500);
});

app.use("/api/*", cors());

app.get("/", (c) => {
  return c.text("OK");
});

const sampleSchema = z.object({
  domain: z.string(),
  browser: z.string(),
  version: z.string(),
  numSections: z.number(),
  numConnections: z.number(),
  numPulls: z.number(),
  numStars: z.number(),
});

app.post("/api/v1/sample", zValidator("json", sampleSchema), async (c) => {
  const payload = c.req.valid("json");
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  await db.insert(dbSchema.samples).values(payload);
  return c.json({ ok: true });
});

export default app;
