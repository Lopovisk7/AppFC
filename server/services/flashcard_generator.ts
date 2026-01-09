import OpenAI from "openai";

// Initialize OpenAI client using Replit AI Integrations environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy-key",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
});

interface Flashcard {
  type: 'cloze' | 'qa' | 'true_false' | 'guided_completion';
  front: string;
  back: string;
  tag: string;
  deck: string;
}

/**
 * Split text into chunks that fit within model context limits.
 * Approximately 4 characters per token, leaving room for prompt.
 */
function chunkText(text: string, maxChunkSize: number = 12000): string[] {
  const chunks: string[] = [];
  let currentPos = 0;
  while (currentPos < text.length) {
    let endPos = currentPos + maxChunkSize;
    if (endPos < text.length) {
      // Find last sentence or newline to avoid cutting in middle of a thought
      const lastNewline = text.lastIndexOf('\n', endPos);
      const lastPeriod = text.lastIndexOf('. ', endPos);
      const breakPoint = Math.max(lastNewline, lastPeriod);
      if (breakPoint > currentPos) {
        endPos = breakPoint + 1;
      }
    }
    chunks.push(text.slice(currentPos, endPos).trim());
    currentPos = endPos;
  }
  return chunks;
}

export async function generateFlashcards(
  text: string,
  mode: string,
  level: string,
  quantity: number
): Promise<Flashcard[]> {
  // If text is very large, split it and distribute the requested quantity
  const chunks = chunkText(text);
  const cardsPerChunk = Math.max(1, Math.ceil(quantity / chunks.length));
  let allCards: Flashcard[] = [];

  for (const chunk of chunks) {
    const systemPrompt = `Você é um desenvolvedor sênior full-stack e educador médico experiente.
Seu objetivo é criar flashcards profissionais de medicina no padrão Anki, selecionando inteligentemente o formato que melhor se adapta a cada conceito.

FORMATOS SUPORTADOS (OBRIGATÓRIO MISTURAR):
1. CLOZE DELETION (type: "cloze"): Use para definições curtas ou associações clássicas. Use sintaxe {{c1::termo}}.
2. QUESTION -> SHORT ANSWER (type: "qa"): Use para "O que é...", "Qual achado...", etc. Resposta concisa (≤ 2 linhas).
3. TRUE / FALSE (type: "true_false"): Use para critérios diagnósticos ou fisiopatologia.
4. GUIDED COMPLETION (type: "guided_completion"): Use para tríades, clusters de sintomas ou padrões sindrômicos.
   - Apresente a estrutura completa do conceito com APENAS UM elemento oculto.
   - Exemplo Front: "A tríade de Cushing consiste em: {{c1::hipertensão}}, bradicardia e irregularidade respiratória."
   - Exemplo Back: "A tríade de Cushing consiste em: hipertensão, bradicardia e irregularidade respiratória."

REGRAS CRÍTICAS:
- REMOVA qualquer forma de múltipla escolha ou questões baseadas em alternativas (A/B/C/D).
- NÃO gere MCQs.
- Use GUIDED COMPLETION apenas para conceitos inerentemente estruturados (tríades, grupos).
- Esconda APENAS UM elemento por cartão no Guided Completion.

REGRAS GERAIS:
- Um fato médico por flashcard. Alto rendimento (high-yield).
- Sem explicações prolixas. Sem texto de preenchimento.
- Máximo de 30 palavras por flashcard.
- Compreensível isoladamente.

SAÍDA:
Responda APENAS com um objeto JSON contendo um array "flashcards", onde cada item tem:
- type: cloze | qa | true_false | guided_completion
- front: prompt mostrado ao usuário
- back: afirmação completa e correta
- tag: especialidade médica
- deck: nome do baralho

MODO: ${mode}
NÍVEL: ${level}
QUANTIDADE: Gere exatamente ${cardsPerChunk} flashcards para este trecho do documento.`;

    const userPrompt = `Texto base para extração de fatos:\n${chunk}`;

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
      if (!content) continue;

      const parsed = JSON.parse(content);
      let chunkCards: Flashcard[] = [];
      
      if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
        chunkCards = parsed.flashcards;
      } else if (Array.isArray(parsed)) {
        chunkCards = parsed;
      } else {
        const values = Object.values(parsed);
        for (const val of values) {
          if (Array.isArray(val)) {
            chunkCards = val as Flashcard[];
            break;
          }
        }
      }
      allCards = [...allCards, ...chunkCards];

    } catch (error) {
      console.error("Error generating flashcards for chunk:", error);
      // Continue to next chunk instead of failing entirely
    }
  }

  if (allCards.length === 0) throw new Error("Failed to generate any flashcards");
  
  // Trim to exact requested quantity if we over-generated due to chunking
  return allCards.slice(0, quantity);
}
