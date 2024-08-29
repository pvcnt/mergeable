CREATE TABLE IF NOT EXISTS "samples" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"domain" varchar(64) NOT NULL,
	"browser" varchar(64) NOT NULL,
	"version" varchar(40),
	"num_sections" integer,
	"num_connections" integer,
	"num_stars" integer,
	"num_pulls" integer
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "browser_idx" ON "samples" USING btree ("browser");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "domain_idx" ON "samples" USING btree ("domain");