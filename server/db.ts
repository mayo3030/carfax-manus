import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

import { adminSettings, InsertAdminSetting, InsertVehicleReport, InsertVinSubmission, vehicleReports, vinSubmissions } from "../drizzle/schema";
import { and, desc } from "drizzle-orm";

// VIN Submission queries
export async function createVinSubmission(submission: InsertVinSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vinSubmissions).values(submission);
  const id = Number(result[0]?.insertId || 0);
  return { id };
}

export async function getVinSubmissionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(vinSubmissions)
    .where(eq(vinSubmissions.userId, userId))
    .orderBy(desc(vinSubmissions.submittedAt));
}

export async function getVinSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(vinSubmissions)
    .where(eq(vinSubmissions.id, id))
    .limit(1);
  
  return result[0];
}

export async function updateVinSubmissionStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: any = { status };
  if (status === "completed" || status === "failed") {
    updates.completedAt = new Date();
  }
  if (errorMessage) {
    updates.errorMessage = errorMessage;
  }
  
  await db.update(vinSubmissions)
    .set(updates)
    .where(eq(vinSubmissions.id, id));
}

export async function getPendingVinSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(vinSubmissions)
    .where(eq(vinSubmissions.status, "pending"))
    .orderBy(vinSubmissions.submittedAt);
}

// Vehicle Report queries
export async function createVehicleReport(report: InsertVehicleReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vehicleReports).values(report);
  return result;
}

export async function getVehicleReportByVinSubmissionId(vinSubmissionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(vehicleReports)
    .where(eq(vehicleReports.vinSubmissionId, vinSubmissionId))
    .limit(1);
  
  return result[0];
}

export async function getVehicleReportByVin(vin: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(vehicleReports)
    .where(eq(vehicleReports.vin, vin))
    .orderBy(desc(vehicleReports.scrapedAt))
    .limit(1);
  
  return result[0];
}

export async function getAllVehicleReports(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    report: vehicleReports,
    submission: vinSubmissions
  })
  .from(vehicleReports)
  .leftJoin(vinSubmissions, eq(vehicleReports.vinSubmissionId, vinSubmissions.id))
  .where(eq(vinSubmissions.userId, userId))
  .orderBy(desc(vehicleReports.scrapedAt));
}

// Admin Settings queries
export async function getAdminSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(adminSettings)
    .where(eq(adminSettings.settingKey, key))
    .limit(1);
  
  return result[0];
}

export async function setAdminSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(adminSettings)
    .values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value, updatedAt: new Date() } });
}

export async function getAllAdminSettings() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(adminSettings);
}
