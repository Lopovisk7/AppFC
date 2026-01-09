import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GenerateFlashcardsRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export type GeneratedFlashcard = {
  front: string;
  back: string;
};

export function useGenerateFlashcards() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GenerateFlashcardsRequest) => {
      // Validate request data before sending
      const validatedData = api.flashcards.generate.input.parse(data);

      const res = await fetch(api.flashcards.generate.path, {
        method: api.flashcards.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate flashcards");
      }

      const responseData = await res.json();
      // Validate response structure
      return api.flashcards.generate.responses[200].parse(responseData);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSaveFlashcard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { front: string; back: string; mode: string; level: string }) => {
      const res = await fetch(api.flashcards.create.path, {
        method: api.flashcards.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save flashcard");
      }

      return api.flashcards.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Saved",
        description: "Flashcard saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: [api.flashcards.list.path] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save flashcard.",
        variant: "destructive",
      });
    },
  });
}
