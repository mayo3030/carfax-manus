import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const carfaxSessions = mysqlTable("carfax_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  encryptedUsername: text("encryptedUsername").notNull(),
  encryptedPassword: text("encryptedPassword").notNull(),
  sessionCookie: text("sessionCookie"),
  lastLoginAt: timestamp("lastLoginAt").defaultNow(),
  expiresAt: timestamp("expiresAt"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CarfaxSession = typeof carfaxSessions.$inferSelect;
export type InsertCarfaxSession = typeof carfaxSessions.$inferInsert;

/**
 * VIN Submissions table - tracks all VIN requests from users
 */
export const vinSubmissions = mysqlTable("vin_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  vin: varchar("vin", { length: 17 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("error_message"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type VinSubmission = typeof vinSubmissions.$inferSelect;
export type InsertVinSubmission = typeof vinSubmissions.$inferInsert;

/**
 * Vehicle reports table - stores scraped Carfax data
 */
export const vehicleReports = mysqlTable("vehicle_reports", {
  id: int("id").autoincrement().primaryKey(),
  vinSubmissionId: int("vin_submission_id").notNull(),
  vin: varchar("vin", { length: 17 }).notNull(),
  
  // Basic vehicle info
  year: int("year"),
  make: varchar("make", { length: 100 }),
  model: varchar("model", { length: 100 }),
  trim: varchar("trim", { length: 100 }),
  
  // Vehicle details
  mileage: int("mileage"),
  price: int("price"),
  color: varchar("color", { length: 50 }),
  engineType: varchar("engine_type", { length: 100 }),
  transmission: varchar("transmission", { length: 50 }),
  
  // History summary
  accidentCount: int("accident_count").default(0),
  ownerCount: int("owner_count").default(0),
  serviceRecordCount: int("service_record_count").default(0),
  
  // Full report data (JSON)
  accidentHistory: text("accident_history"),
  serviceHistory: text("service_history"),
  ownershipHistory: text("ownership_history"),
  titleInfo: text("title_info"),
  additionalData: text("additional_data"),
  
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
});

export type VehicleReport = typeof vehicleReports.$inferSelect;
export type InsertVehicleReport = typeof vehicleReports.$inferInsert;

/**
 * Admin settings table - stores scraping configuration
 */
export const adminSettings = mysqlTable("admin_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;