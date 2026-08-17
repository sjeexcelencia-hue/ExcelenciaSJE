import { pgTable, serial, varchar, integer, text, doublePrecision } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull().default(0),
  image: text("image"),
  category: varchar("category", { length: 100 }),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
});

