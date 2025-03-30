import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table preserved
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for text comparison request
export const compareRecitation = z.object({
  recognizedText: z.string(),
});

// Types for text comparison results
export type ComparisonResult = {
  words: { text: string; isCorrect: boolean }[];
  errors: { word: string; correctWord: string; index: number }[];
  warnings: { title: string; description: string }[];
  feedback: { 
    type: 'error' | 'warning';
    title: string;
    description: string;
  }[];
};
