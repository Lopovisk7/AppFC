import { db } from "./db";
import { flashcards, type InsertFlashcard, type Flashcard } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  getFlashcards(): Promise<Flashcard[]>;
}

export class DatabaseStorage implements IStorage {
  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db
      .insert(flashcards)
      .values(flashcard)
      .returning();
    return newFlashcard;
  }

  async getFlashcards(): Promise<Flashcard[]> {
    return await db
      .select()
      .from(flashcards)
      .orderBy(desc(flashcards.createdAt));
  }
}

export const storage = new DatabaseStorage();
