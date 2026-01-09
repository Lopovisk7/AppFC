import OpenAI from "openai";

// Initialize OpenAI client using Replit AI Integrations environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy-key",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
});

interface Flashcard {
  front: string;
  back: string;
}

export async function generateFlashcards(
  text: string,
  mode: string,
  level: string,
  quantity: number
): Promise<Flashcard[]> {
  const systemPrompt = `Você é um desenvolvedor sênior full-stack e educador médico experiente.
Seu objetivo é criar flashcards profissionais de medicina no padrão Anki.

DIRETRIZES:
- As perguntas devem ser similares às cobradas em provas de residência médica.
- Para flashcards clínicos, inclua a conduta/tratamento quando aplicável.
- Evite textos longos e redundantes. Seja direto e objetivo.
- Foque no que é clinicamente relevante.

MODO: ${mode}
NÍVEL: ${level}
QUANTIDADE: ${quantity} flashcards

Responda APENAS com um array JSON de objetos, onde cada objeto tem "front" (pergunta) e "back" (resposta).
Exemplo: [{"front": "Pergunta...", "back": "Resposta..."}]`;

  const userPrompt = `Texto base para estudo:\n${text}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1", // Using the latest available model as per blueprint
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    // Parse the response
    const parsed = JSON.parse(content);
    // Handle different possible JSON structures (array or object with key)
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
      return parsed.flashcards;
    } else {
      // Fallback: try to find an array in the object values
      const values = Object.values(parsed);
      for (const val of values) {
        if (Array.isArray(val)) return val as Flashcard[];
      }
      throw new Error("Could not parse flashcards from response");
    }

  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
}
