import OpenAI from "openai";

// Initialize OpenAI client using Replit AI Integrations environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy-key",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
});

interface Flashcard {
  type: 'cloze' | 'qa' | 'true_false' | 'multiple_choice';
  front: string;
  back: string;
  tag: string;
  deck: string;
}

export async function generateFlashcards(
  text: string,
  mode: string,
  level: string,
  quantity: number
): Promise<Flashcard[]> {
  const systemPrompt = `Você é um desenvolvedor sênior full-stack e educador médico experiente.
Seu objetivo é criar flashcards profissionais de medicina no padrão Anki, selecionando inteligentemente o formato que melhor se adapta a cada conceito.

FORMATOS SUPORTADOS (OBRIGATÓRIO MISTURAR):
1. CLOZE DELETION (type: "cloze"): Use para definições curtas ou associações clássicas. Use sintaxe {{c1::termo}}.
2. QUESTION -> SHORT ANSWER (type: "qa"): Use para "O que é...", "Qual achado...", etc. Resposta concisa (≤ 2 linhas).
3. TRUE / FALSE (type: "true_false"): Use para critérios diagnósticos ou fisiopatologia.
4. MULTIPLE CHOICE (type: "multiple_choice"): Use para síndromes, grupos de sintomas ou tríades. Forneça opções no front e a correta no back.

REGRAS DE SELEÇÃO INTELIGENTE:
- Decida o tipo que melhor se adapta a CADA conceito.
- NÃO gere todos os cartões no mesmo formato.
- Evite o uso excessivo de cloze deletions.
- Priorize força de retenção e raciocínio clínico.

REGRAS GERAIS:
- Um fato médico por flashcard. Alto rendimento (high-yield).
- Sem explicações prolixas. Sem texto de preenchimento.
- Máximo de 30 palavras por flashcard.
- Compreensível isoladamente.

SAÍDA:
Responda APENAS com um objeto JSON contendo um array "flashcards", onde cada item tem:
- type: cloze | qa | true_false | multiple_choice
- front: pergunta / afirmação / prompt
- back: resposta / explicação curta
- tag: especialidade médica
- deck: nome do baralho

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
    
    if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
      cards = parsed.flashcards;
    } else if (Array.isArray(parsed)) {
      cards = parsed;
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
