import { type GeneratedFlashcard } from "@/hooks/use-flashcards";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

  return (
    <div 
      className={cn("flashcard", isFlipped && "flipped")}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <p className="text-lg font-medium leading-relaxed">
            {renderCloze(card.front, false)}
          </p>
        </div>
        <div className="flashcard-back">
          <p className="text-lg font-medium leading-relaxed">
            {renderCloze(card.back, true)}
          </p>
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
