import { motion } from "framer-motion";
import { type GeneratedFlashcard } from "@/hooks/use-flashcards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";

interface FlashcardGridProps {
  cards: GeneratedFlashcard[];
}

function FlashcardItem({ card, index }: { card: GeneratedFlashcard; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="perspective-1000 h-80 w-full cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "relative h-full w-full transition-all duration-500 transform-style-3d",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front */}
        <Card className="absolute h-full w-full backface-hidden flex flex-col justify-between overflow-hidden border-2 hover:border-primary/50 transition-colors">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Question {index + 1}
              </Badge>
              <RefreshCcw className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-medium text-center leading-relaxed text-foreground">
                {card.front}
              </p>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4 font-medium uppercase tracking-widest opacity-50">
              Click to reveal answer
            </p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className="absolute h-full w-full backface-hidden rotate-y-180 flex flex-col justify-between overflow-hidden bg-slate-900 text-slate-50 border-2 border-slate-700">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/50" />
          <CardContent className="p-6 flex flex-col h-full">
             <div className="flex justify-between items-center mb-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold text-slate-400 border-slate-700">
                Answer
              </Badge>
              <RefreshCcw className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar">
              <p className="text-base text-center leading-relaxed text-slate-200">
                {card.back}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export function FlashcardGrid({ cards }: FlashcardGridProps) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {cards.map((card, idx) => (
        <FlashcardItem key={idx} card={card} index={idx} />
      ))}
    </div>
  );
}
