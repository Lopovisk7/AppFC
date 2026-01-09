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
Seu objetivo é criar flashcards profissionais de medicina no padrão Anki usando exclusivamente o formato CLOZE-DELETION.

REGRAS DE FORMATO:
- Gere APENAS flashcards de omissão de palavras (cloze deletion) usando a sintaxe {{c1::termo}}.
- Cada flashcard deve ser uma única sentença ou fato médico de alto rendimento.
- Responda com um array JSON de objetos: {"front": "sentença com cloze", "back": "sentença completa com o termo revelado"}.

REGRAS DE CONTEÚDO (MANDATÓRIAS):
- Máximo de 30 palavras por flashcard.
- No máximo 2 omissões (clozes) por sentença.
- Cada omissão deve esconder apenas UMA palavra-chave ou frase curta.
- Foque em: Definições, Mecanismos, Indicações, Contraindicações, Achados de Imagem Clássicos, Critérios Diagnósticos.
- Evite: Explicações longas, estatísticas não essenciais, curiosidades.
- Cada flashcard deve ser compreensível isoladamente.

MODO: ${mode}
NÍVEL: ${level}
QUANTIDADE: ${quantity} flashcards`;

  const userPrompt = `Texto base para extração de fatos:\n${text}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
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

    const parsed = JSON.parse(content);
    let cards: Flashcard[] = [];
    
    if (Array.isArray(parsed)) {
      cards = parsed;
    } else if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
      cards = parsed.flashcards;
    } else {
      const values = Object.values(parsed);
      for (const val of values) {
        if (Array.isArray(val)) {
          cards = val as Flashcard[];
          break;
        }
      }
    }

    if (cards.length === 0) throw new Error("Could not parse flashcards");
    return cards;

  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
}
