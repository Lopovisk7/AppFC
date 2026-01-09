import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default('cloze'), // cloze, qa, true_false, guided_completion
  front: text("front").notNull(),
  back: text("back").notNull(),
  tag: text("tag").notNull().default('Medical'),
  deck: text("deck").notNull().default('Default'),
  mode: text("mode").notNull(), // conceptual, clinical, board
  level: text("level").notNull(), // basic, intern, resident
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ 
  id: true, 
  createdAt: true 
});

export const generateFlashcardsSchema = z.object({
  text: z.string().min(1, "Text is required"),
  mode: z.enum(["conceptual", "clinical", "board"]),
  level: z.enum(["basic", "intern", "resident"]),
  quantity: z.number().min(5).max(20)
});

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type GenerateFlashcardsRequest = z.infer<typeof generateFlashcardsSchema>;

export * from "./models/chat";
