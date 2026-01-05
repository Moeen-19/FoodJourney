import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  city: text("city"),
  dietaryPreferences: jsonb("dietary_preferences").$type<
    Record<string, boolean>
  >(),
  budgetRange: text("budget_range"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businesses = pgTable("businesses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  priceRange: text("price_range"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  imageUrl: text("image_url"),
  cuisineType: text("cuisine_type"),
  dietaryOptions: jsonb("dietary_options").$type<string[]>(),
  openHours: jsonb("open_hours").$type<Record<string, string>>(),
  reservationsEnabled: boolean("reservations_enabled").default(true),
  averageWaitTime: integer("average_wait_time"),
  coordinates: jsonb("coordinates").$type<{
    latitude: number;
    longitude: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  businessId: varchar("business_id").references(() => businesses.id),
  date: timestamp("date").notNull(),
  partySize: integer("party_size").notNull(),
  status: text("status").notNull().default("pending"),
  specialRequests: text("special_requests"),
  confirmationCode: text("confirmation_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const itineraries = pgTable("itineraries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  city: text("city"),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }),
  isPublic: boolean("is_public").default(false),
  shareCode: text("share_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const itineraryDays = pgTable("itinerary_days", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  itineraryId: varchar("itinerary_id").references(() => itineraries.id),
  dayNumber: integer("day_number").notNull(),
  title: text("title"),
  date: timestamp("date"),
});

export const itineraryStops = pgTable("itinerary_stops", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dayId: varchar("day_id").references(() => itineraryDays.id),
  businessId: varchar("business_id").references(() => businesses.id),
  time: text("time").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  duration: integer("duration"),
  notes: text("notes"),
  orderIndex: integer("order_index").notNull(),
});

export const budgetTransactions = pgTable("budget_transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  businessId: varchar("business_id").references(() => businesses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow(),
  type: text("type").notNull(),
});

export const spendingInsights = pgTable("spending_insights", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  period: text("period").notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }),
  categoryBreakdown:
    jsonb("category_breakdown").$type<Record<string, number>>(),
  recommendations: jsonb("recommendations").$type<string[]>(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  businessId: varchar("business_id").references(() => businesses.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sharedItems = pgTable("shared_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  itemType: text("item_type").notNull(),
  itemId: varchar("item_id").notNull(),
  sharedWithUserId: varchar("shared_with_user_id").references(() => users.id),
  shareCode: text("share_code").unique(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cachedData = pgTable("cached_data", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  dataType: text("data_type").notNull(),
  data: jsonb("data"),
  version: integer("version").default(1),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const friends = pgTable("friends", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  friendId: varchar("friend_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityFeed = pgTable("activity_feed", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  entityType: text("entity_type"),
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
  itineraries: many(itineraries),
  budgetTransactions: many(budgetTransactions),
  favorites: many(favorites),
  friends: many(friends),
  activities: many(activityFeed),
}));

export const businessesRelations = relations(businesses, ({ many }) => ({
  reservations: many(reservations),
  favorites: many(favorites),
}));

export const itinerariesRelations = relations(itineraries, ({ one, many }) => ({
  user: one(users, { fields: [itineraries.userId], references: [users.id] }),
  days: many(itineraryDays),
}));

export const itineraryDaysRelations = relations(
  itineraryDays,
  ({ one, many }) => ({
    itinerary: one(itineraries, {
      fields: [itineraryDays.itineraryId],
      references: [itineraries.id],
    }),
    stops: many(itineraryStops),
  }),
);

export const itineraryStopsRelations = relations(itineraryStops, ({ one }) => ({
  day: one(itineraryDays, {
    fields: [itineraryStops.dayId],
    references: [itineraryDays.id],
  }),
  business: one(businesses, {
    fields: [itineraryStops.businessId],
    references: [businesses.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  business: one(businesses, {
    fields: [reservations.businessId],
    references: [businesses.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBusinessSchema = createInsertSchema(businesses);
export const insertReservationSchema = createInsertSchema(reservations);
export const insertItinerarySchema = createInsertSchema(itineraries);
export const insertBudgetTransactionSchema =
  createInsertSchema(budgetTransactions);
export const insertFavoriteSchema = createInsertSchema(favorites);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type Itinerary = typeof itineraries.$inferSelect;
export type ItineraryDay = typeof itineraryDays.$inferSelect;
export type ItineraryStop = typeof itineraryStops.$inferSelect;
export type BudgetTransaction = typeof budgetTransactions.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type SharedItem = typeof sharedItems.$inferSelect;
export type Friend = typeof friends.$inferSelect;
export type Activity = typeof activityFeed.$inferSelect;
