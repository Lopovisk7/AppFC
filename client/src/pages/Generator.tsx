import { useState } from "react";
import { useGenerateFlashcards, type GeneratedFlashcard } from "@/hooks/use-flashcards";
import { FlashcardGrid } from "@/components/FlashcardGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Brain, FileDown, Copy, Loader2, Sparkles, BookOpen } from "lucide-react";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Generator() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"conceptual" | "clinical" | "board">("conceptual");
  const [level, setLevel] = useState<"basic" | "intern" | "resident">("basic");
  const [quantity, setQuantity] = useState([10]);
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
  
  const { mutate: generate, isPending } = useGenerateFlashcards();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!text.trim()) {
      toast({
        title: "Content missing",
        description: "Please paste some medical text to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    generate(
      { text, mode, level, quantity: quantity[0] },
      {
        onSuccess: (data) => {
          setGeneratedCards(data);
          toast({
            title: "Success!",
            description: `Generated ${data.length} flashcards successfully.`,
          });
          // Scroll to results
          setTimeout(() => {
            document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
      }
    );
  };

  const handleExportAnki = () => {
    if (generatedCards.length === 0) return;
    
    const content = generatedCards
      .map((card) => `${card.front.replace(/;/g, ",")};${card.back.replace(/;/g, ",")}`)
      .join("\n");
      
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `mediflash-export-${new Date().toISOString().slice(0, 10)}.txt`);
    
    toast({
      title: "Export Complete",
      description: "Anki import file downloaded.",
    });
  };

  const handleCopyToClipboard = () => {
    if (generatedCards.length === 0) return;
    
    const content = generatedCards
      .map((card) => `Q: ${card.front}\nA: ${card.back}`)
      .join("\n\n---\n\n");
      
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Flashcards copied to clipboard.",
    });
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-12 lg:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Brain className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-blue-200 mb-6 border border-white/10">
              <Sparkles className="w-3 h-3" />
              <span>AI-Powered Medical Study Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
              Master Medicine with <span className="text-blue-400">Smart Flashcards</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Paste your notes, textbook chapters, or guidelines. We'll generate high-yield, 
              exam-ready flashcards tailored to your training level.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Input */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-2 border-border/50 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Source Material</h2>
              </div>
              
              <Textarea
                placeholder="Paste medical text here (e.g., UpToDate article, textbook chapter, lecture notes)..."
                className="min-h-[400px] text-base leading-relaxed p-6 resize-none rounded-xl bg-slate-50/50 focus:bg-white transition-all border-slate-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 font-mono"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Supports up to 5000 characters</span>
                <span>{text.length} chars</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-24 border-2 border-border/50 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 space-y-8">
              <div>
                <Label className="text-base font-semibold mb-3 block">Flashcard Mode</Label>
                <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                  <SelectTrigger className="h-12 text-base bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conceptual">
                      <div className="flex flex-col gap-1 py-1">
                        <span className="font-medium">Conceptual</span>
                        <span className="text-xs text-muted-foreground">Definitions & mechanisms</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="clinical">
                      <div className="flex flex-col gap-1 py-1">
                        <span className="font-medium">Clinical Case</span>
                        <span className="text-xs text-muted-foreground">Vignettes & diagnosis</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="board">
                      <div className="flex flex-col gap-1 py-1">
                        <span className="font-medium">Board Exam</span>
                        <span className="text-xs text-muted-foreground">High-yield rapid review</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Training Level</Label>
                <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                  <SelectTrigger className="h-12 text-base bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Sciences (M1/M2)</SelectItem>
                    <SelectItem value="intern">Clinical Clerkship (M3/M4)</SelectItem>
                    <SelectItem value="resident">Residency / Fellowship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Quantity</Label>
                  <span className="bg-secondary px-2 py-1 rounded-md text-sm font-mono font-medium">
                    {quantity[0]} cards
                  </span>
                </div>
                <Slider
                  value={quantity}
                  onValueChange={setQuantity}
                  min={5}
                  max={20}
                  step={1}
                  className="py-4"
                />
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isPending || !text.trim()}
                  variant="gradient"
                  size="lg"
                  className="w-full text-lg font-semibold shadow-blue-500/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" />
                      Generate Flashcards
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {generatedCards.length > 0 && (
          <motion.div
            id="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8 pt-12 border-t"
          >
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-900">Generated Flashcards</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Review your cards below. Click any card to flip it.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCopyToClipboard} className="h-11">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Text
                </Button>
                <Button onClick={handleExportAnki} className="bg-slate-900 text-white hover:bg-slate-800 h-11">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export to Anki
                </Button>
              </div>
            </div>

            <FlashcardGrid cards={generatedCards} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
