import { eq } from "drizzle-orm";
import { carfaxSessions, InsertCarfaxSession } from "../drizzle/schema";
import { getDb } from "./db";
import { encryptCredential, decryptCredential } from "./_core/encryption";

/**
 * Store Carfax credentials securely for a user
 */
export async function storeCarfaxCredentials(
  userId: number,
  username: string,
  password: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const encryptedUsername = encryptCredential(username);
  const encryptedPassword = encryptCredential(password);

  await db
    .insert(carfaxSessions)
    .values({
      userId,
      encryptedUsername,
      encryptedPassword,
      isActive: 1,
    })
    .onDuplicateKeyUpdate({
      set: {
        encryptedUsername,
        encryptedPassword,
        isActive: 1,
        updatedAt: new Date(),
      },
    });
}

/**
 * Retrieve decrypted Carfax credentials for a user
 */
export async function getCarfaxCredentials(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const session = await db
    .select()
    .from(carfaxSessions)
    .where(eq(carfaxSessions.userId, userId))
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  const cred = session[0];
  return {
    username: decryptCredential(cred.encryptedUsername),
    password: decryptCredential(cred.encryptedPassword),
    sessionCookie: cred.sessionCookie,
    lastLoginAt: cred.lastLoginAt,
  };
}

/**
 * Update session cookie after successful login
 */
export async function updateSessionCookie(userId: number, cookie: string, expiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(carfaxSessions)
    .set({
      sessionCookie: cookie,
      lastLoginAt: new Date(),
      expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(carfaxSessions.userId, userId));
}

/**
 * Get valid session cookie if it exists and hasn't expired
 */
export async function getValidSessionCookie(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const session = await db
    .select()
    .from(carfaxSessions)
    .where(eq(carfaxSessions.userId, userId))
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  const cred = session[0];
  if (!cred.sessionCookie || !cred.expiresAt) {
    return null;
  }

  if (new Date() > cred.expiresAt) {
    return null;
  }

  return cred.sessionCookie;
}
