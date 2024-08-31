import {
  pgTable,
  varchar,
  integer,
  index,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

export const samples = pgTable(
  "samples",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    domain: varchar("domain", { length: 64 }).notNull(),
    browser: varchar("browser", { length: 64 }).notNull(),
    version: varchar("version", { length: 40 }),
    numSections: integer("num_sections"),
    numConnections: integer("num_connections"),
    numStars: integer("num_stars"),
    numPulls: integer("num_pulls"),
  },
  (table) => {
    return {
      browserIdx: index("browser_idx").on(table.browser),
      domainIdx: index("domain_idx").on(table.domain),
    };
  },
);
