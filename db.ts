import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  glucoseReadings,
  bloodPressureReadings,
  medications,
  medicationDoses,
  labUploads,
  chatMessages,
  healthNews,
  type GlucoseReading,
  type BloodPressureReading,
  type Medication,
  type MedicationDose,
  type LabUpload,
  type ChatMessage,
  type HealthNews,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Glucose reading helpers
export async function addGlucoseReading(
  userId: number,
  value: number,
  readingDate: Date,
  notes?: string
): Promise<GlucoseReading> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(glucoseReadings).values({
    userId,
    value: value.toString() as any,
    readingDate,
    notes,
  });

  const inserted = await db
    .select()
    .from(glucoseReadings)
    .where(eq(glucoseReadings.userId, userId))
    .orderBy(desc(glucoseReadings.createdAt))
    .limit(1);

  return inserted[0];
}

export async function getGlucoseReadings(
  userId: number,
  limit: number = 100
): Promise<GlucoseReading[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(glucoseReadings)
    .where(eq(glucoseReadings.userId, userId))
    .orderBy(desc(glucoseReadings.readingDate))
    .limit(limit);
}

// Blood pressure reading helpers
export async function addBloodPressureReading(
  userId: number,
  systolic: number,
  diastolic: number,
  pulse: number,
  readingDate: Date,
  notes?: string
): Promise<BloodPressureReading> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(bloodPressureReadings).values({
    userId,
    systolic,
    diastolic,
    pulse,
    readingDate,
    notes,
  });

  const inserted = await db
    .select()
    .from(bloodPressureReadings)
    .where(eq(bloodPressureReadings.userId, userId))
    .orderBy(desc(bloodPressureReadings.createdAt))
    .limit(1);

  return inserted[0];
}

export async function getBloodPressureReadings(
  userId: number,
  limit: number = 100
): Promise<BloodPressureReading[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(bloodPressureReadings)
    .where(eq(bloodPressureReadings.userId, userId))
    .orderBy(desc(bloodPressureReadings.readingDate))
    .limit(limit);
}

// Medication helpers
export async function addMedication(
  userId: number,
  name: string,
  dosage: string,
  frequency: string,
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
): Promise<Medication> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(medications).values({
    userId,
    name,
    dosage,
    frequency,
    timeOfDay,
  });

  const inserted = await db
    .select()
    .from(medications)
    .where(eq(medications.userId, userId))
    .orderBy(desc(medications.createdAt))
    .limit(1);

  return inserted[0];
}

export async function getMedications(userId: number): Promise<Medication[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(medications)
    .where(eq(medications.userId, userId))
    .orderBy(medications.timeOfDay);
}

export async function deleteMedication(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(medications).where(eq(medications.id, id));
}

// Medication dose helpers
export async function markMedicationDose(
  medicationId: number,
  userId: number,
  doseDate: Date,
  taken: boolean
): Promise<MedicationDose> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(medicationDoses).values({
    medicationId,
    userId,
    doseDate,
    taken: taken ? 1 : 0,
  });

  const inserted = await db
    .select()
    .from(medicationDoses)
    .where(eq(medicationDoses.userId, userId))
    .orderBy(desc(medicationDoses.createdAt))
    .limit(1);

  return inserted[0];
}

export async function getTodayMedicationDoses(
  userId: number,
  date: Date
): Promise<(MedicationDose & { medication: Medication })[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const doses = await db
    .select()
    .from(medicationDoses)
    .where(
      and(
        eq(medicationDoses.userId, userId),
        // Add date range filter if supported by Drizzle
      )
    )
    .limit(100);

  // Filter in memory for dates
  return doses.filter((d) => {
    const doseTime = new Date(d.doseDate);
    return doseTime >= startOfDay && doseTime <= endOfDay;
  }) as any;
}

// Lab upload helpers
export async function addLabUpload(
  userId: number,
  fileName: string,
  fileUrl: string,
  fileKey: string,
  mimeType: string,
  extractedData?: Record<string, any>
): Promise<LabUpload> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(labUploads).values({
    userId,
    fileName,
    fileUrl,
    fileKey,
    mimeType,
    extractedData: extractedData ? JSON.stringify(extractedData) : null,
  });

  const inserted = await db
    .select()
    .from(labUploads)
    .where(eq(labUploads.userId, userId))
    .orderBy(desc(labUploads.uploadedAt))
    .limit(1);

  return inserted[0];
}

export async function getLabUploads(
  userId: number,
  limit: number = 50
): Promise<LabUpload[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(labUploads)
    .where(eq(labUploads.userId, userId))
    .orderBy(desc(labUploads.uploadedAt))
    .limit(limit);
}

// Chat message helpers
export async function addChatMessage(
  userId: number,
  role: "user" | "assistant" | "system",
  content: string
): Promise<ChatMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(chatMessages).values({
    userId,
    role,
    content,
  });

  const inserted = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(1);

  return inserted[0];
}

export async function getChatMessages(
  userId: number,
  limit: number = 100
): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit)
    .then((msgs) => msgs.reverse()); // Return in chronological order
}

// Health news helpers
export async function getHealthNews(
  category?: string,
  limit: number = 20
): Promise<HealthNews[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(healthNews);

  if (category) {
    query = query.where(eq(healthNews.category, category)) as any;
  }

  return (query as any)
    .orderBy(desc(healthNews.publishedAt))
    .limit(limit);
}

export async function getHealthNewsCategories(): Promise<string[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .selectDistinct({ category: healthNews.category })
    .from(healthNews);

  return result.map((r) => r.category);
}
