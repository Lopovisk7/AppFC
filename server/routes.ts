import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { generateFlashcards } from "./services/flashcard_generator";
import { insertFlashcardSchema } from "@shared/schema";
import { z } from "zod";

// Import integration routes
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Generate Flashcards
  app.post(api.flashcards.generate.path, async (req, res) => {
    try {
      const { text, mode, level, quantity } = api.flashcards.generate.input.parse(req.body);
      const flashcards = await generateFlashcards(text, mode, level, quantity);
      res.json(flashcards);
    } catch (error) {
      console.error("Generate error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ message: "Failed to generate flashcards" });
      }
    }
  });

  // Save Flashcard
  app.post(api.flashcards.create.path, async (req, res) => {
    try {
      const input = insertFlashcardSchema.parse(req.body);
      const flashcard = await storage.createFlashcard(input);
      res.status(201).json(flashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save flashcard" });
      }
    }
  });

  // List Flashcards
  app.get(api.flashcards.list.path, async (req, res) => {
    try {
      const flashcards = await storage.getFlashcards();
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to list flashcards" });
    }
  });

  return httpServer;
}
