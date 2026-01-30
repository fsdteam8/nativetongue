import z from "zod";

export const pickSchema = z.object({
  content: z.string().min(1, "Content is required"),
  sport: z.string().min(1, "Sport is required"),
  betType: z.string().min(1, "Bet type is required"),
  odds: z.string().min(1, "Odds are required"),
  stake: z.string().optional(),
  confidence: z.number().min(1).max(10),
  reasoning: z.string().optional(),
});