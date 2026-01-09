import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { generateFlashcards } from "./services/flashcard_generator";
import { insertFlashcardSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import * as pdf from "pdf-parse";
const pdfParse = (pdf as any).default || pdf;

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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
  app.post(api.flashcards.generate.path, upload.single("pdf"), async (req, res) => {
    try {
      let text = req.body.text;
      const mode = req.body.mode;
      const level = req.body.level;
      const quantity = parseInt(req.body.quantity);

      // If PDF is uploaded, extract its text
      if (req.file) {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
        
        if (!text || text.trim().length === 0) {
          return res.status(400).json({ message: "PDF contains no extractable text" });
        }
      }

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "No text or PDF provided" });
      }

      const generatedCards = await generateFlashcards(text, mode, level, quantity);
      res.json(generatedCards);
    } catch (error) {
      console.error("Generate error:", error);
      res.status(500).json({ message: "Failed to generate flashcards" });
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
