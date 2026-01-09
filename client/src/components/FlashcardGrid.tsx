import { type GeneratedFlashcard } from "@/hooks/use-flashcards";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Flashcard {
  type: 'cloze' | 'qa' | 'true_false' | 'guided_completion';
  front: string;
  back: string;
  tag?: string;
  deck?: string;
}

interface FlashcardGridProps {
  cards: GeneratedFlashcard[];
}

function FlashcardItem({ card }: { card: GeneratedFlashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Helper to render cloze deletion text
  const renderCloze = (text: string, isBack: boolean) => {
    // Matches {{c1::term}}
    const parts = text.split(/(\{\{c\d+::.*?\}\})/g);
    return parts.map((part, i) => {
      const match = part.match(/\{\{c\d+::(.*?)\}\}/);
      if (match) {
        const content = match[1];
        return isBack ? (
          <span key={i} className="cloze-revealed">{content}</span>
        ) : (
          <span key={i} className="cloze-placeholder">[...]</span>
        );
      }
      return part;
    });
  };

  const renderContent = (isBack: boolean) => {
    const text = isBack ? card.back : card.front;
    if (card.type === 'cloze' || card.type === 'guided_completion') {
      return renderCloze(text, isBack);
    }
    return text;
  };

  return (
    <div 
      className={cn("flashcard", isFlipped && "flipped")}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit self-center mb-2 uppercase text-[10px] tracking-widest opacity-70">
              {card.type.replace('_', ' ')}
            </Badge>
            <p className="text-lg font-medium leading-relaxed">
              {renderContent(false)}
            </p>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit self-center mb-2 uppercase text-[10px] tracking-widest">
              Resposta
            </Badge>
            <p className="text-lg font-medium leading-relaxed">
              {renderContent(true)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlashcardGrid({ cards }: FlashcardGridProps) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <FlashcardItem key={idx} card={card} />
      ))}
    </div>
  );
}
