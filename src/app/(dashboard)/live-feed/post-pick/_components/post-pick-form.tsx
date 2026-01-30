/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { pickSchema } from "@/schema/pickSchema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PostPickForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();
  const token = (session.data as any)?.user?.accessToken as string;
  const router = useRouter();

  const form = useForm<z.infer<typeof pickSchema>>({
    resolver: zodResolver(pickSchema),
    defaultValues: {
      content: "",
      sport: "",
      betType: "",
      odds: "",
      stake: "",
      confidence: 3,
      reasoning: "",
    },
  });

  async function onSubmit(values: z.infer<typeof pickSchema>) {
    if (!token) {
      toast("Please login to post a pick");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        content: values.content,
        sport: values.sport,
        betType: values.betType,
        odds: values.odds,
        stake: values.stake,
        confidence: values.confidence,
        reasoning: values.reasoning,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post pick");
      }

      toast("Your pick has been posted successfully");
      router.push("/live-feed");
      form.reset();
    } catch (error) {
      console.error("Error posting pick:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const confidenceValue = form.watch("confidence");

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Sport Input */}
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Sport</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., NBA, Football, Cricket"
                    className="bg-[#0f0f0f] border-zinc-800 h-12 focus-visible:ring-emerald-500"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bet Type */}
          <FormField
            control={form.control}
            name="betType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Bet Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., moneyline, spread, over/under"
                    className="bg-[#0f0f0f] border-zinc-800 h-12 focus-visible:ring-emerald-500"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content (Main Text) */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your pick..."
                    className="bg-[#0f0f0f] border-zinc-800 min-h-[120px] resize-none focus-visible:ring-emerald-500"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Odds */}
          <FormField
            control={form.control}
            name="odds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Odds</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., -110, +180, 1.85"
                    className="bg-[#0f0f0f] border-zinc-800 h-12 focus-visible:ring-emerald-500"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stake */}
          <FormField
            control={form.control}
            name="stake"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">
                  Stake (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 25, 100, 0.5"
                    className="bg-[#0f0f0f] border-zinc-800 h-12 focus-visible:ring-emerald-500"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Confidence Slider */}
          {/* Confidence Slider */}
          <FormField
            control={form.control}
            name="confidence"
            render={({ field }) => (
              <FormItem className="bg-[#0f0f0f] border border-zinc-800 rounded-lg p-6 space-y-6">
                <div className="flex justify-between items-center">
                  {/* Label must be inside FormItem */}
                  <FormLabel className="text-zinc-400">Confidence</FormLabel>
                  <span className="text-sm text-zinc-300">
                    {confidenceValue.toString().padStart(2, "0")}/10
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(vals) => field.onChange(vals[0])}
                    disabled={isSubmitting}
                    className="w-full 
                    [&_[data-orientation=horizontal]]:h-2 
                    [&_.relative]:h-2 
                    [&_.relative]:bg-zinc-800 
                    [&_[data-radix-collection-item]]:bg-emerald-500 
                    [&_[data-radix-collection-item]]:border-none 
                    [&_[data-radix-collection-item]]:h-6 
                    [&_[data-radix-collection-item]]:w-6 
                    [&_.absolute]:bg-emerald-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reasoning Textarea */}
          <FormField
            control={form.control}
            name="reasoning"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">
                  Reasoning (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain your analysis and reasoning..."
                    className="bg-[#0f0f0f] border-zinc-800 min-h-[120px] resize-none focus-visible:ring-emerald-500"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Post Button */}
          <div className="text-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-[250px] bg-gradient-to-r from-[#329150] to-[#0d4728] hover:bg-gradient-to-r hover:from-[#0d4728] hover:to-[#329150] text-white font-semibold h-12 text-lg rounded-md mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Posting...
                </>
              ) : (
                "Post pick"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
