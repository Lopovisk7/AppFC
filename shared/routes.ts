import { z } from 'zod';
import { insertFlashcardSchema, flashcards, generateFlashcardsSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  flashcards: {
    generate: {
      method: 'POST' as const,
      path: '/api/generate',
      input: generateFlashcardsSchema,
      responses: {
        200: z.array(z.object({
          type: z.enum(['cloze', 'qa', 'true_false', 'guided_completion']),
          front: z.string(),
          back: z.string(),
          tag: z.string().optional(),
          deck: z.string().optional()
        })),
        400: errorSchemas.validation,
        500: errorSchemas.internal
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/flashcards',
      responses: {
        200: z.array(z.custom<typeof flashcards.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/flashcards',
      input: insertFlashcardSchema,
      responses: {
        201: z.custom<typeof flashcards.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
