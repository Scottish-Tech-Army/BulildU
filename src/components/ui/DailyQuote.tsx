"use client";

import { useEffect, useState } from "react";
import { Quote as QuoteIcon } from "lucide-react";

interface Quote {
  q: string; // quote text
  a: string; // author name
}

interface CachedQuote {
  quote: Quote;
  date: string; // ISO date string (YYYY-MM-DD)
}

const QUOTE_CACHE_KEY = "empwru_daily_quote";

/**
 * Get today's date as YYYY-MM-DD string
 */
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * DailyQuote - Displays the daily inspirational quote from ZenQuotes API
 * 
 * Uses the free tier which provides a "quote of the day" that changes at midnight CST.
 * Caches the quote in localStorage for the day to minimize API calls.
 * Includes required attribution per ZenQuotes API terms.
 */
interface DailyQuoteProps {
  className?: string;
}

export default function DailyQuote({ className = "" }: DailyQuoteProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadQuote() {
      const today = getTodayDateString();
      
      // Check localStorage for cached quote
      try {
        const cached = localStorage.getItem(QUOTE_CACHE_KEY);
        if (cached) {
          const parsed: CachedQuote = JSON.parse(cached);
          if (parsed.date === today && parsed.quote) {
            setQuote(parsed.quote);
            setIsLoading(false);
            return; // Use cached quote, no need to fetch
          }
        }
      } catch {
        // Invalid cache, continue to fetch
      }

      // Fetch fresh quote from API
      try {
        const response = await fetch("/api/quote");
        
        if (!response.ok) {
          throw new Error("Failed to fetch quote");
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const newQuote = { q: data[0].q, a: data[0].a };
          setQuote(newQuote);
          
          // Cache for today
          const cacheData: CachedQuote = { quote: newQuote, date: today };
          localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(cacheData));
        }
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuote();
  }, []);

  if (isLoading) {
    return (
      <section className={`${className}`}>
        <div className="bg-warm-ivory rounded-2xl py-8 px-12 h-full">
          <div className="animate-pulse flex gap-4">
            <div className="w-8 h-8 bg-white rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-white rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !quote) {
    return null; // Gracefully hide if API fails
  }

  return (
    <section className={`flex flex-col ${className}`}>
      <h2 className="text-sm text-text-muted uppercase tracking-wide mb-3">
        Daily Inspiration
      </h2>
      <div className="bg-warm-ivory rounded-2xl py-8 px-12 flex-1 flex flex-col justify-center">
        <div className="flex gap-4">
          <QuoteIcon className="w-8 h-8 text-brand-primary flex-shrink-0" fill="currentColor" />
          <div>
            <blockquote className="text-[var(--color-charcoal)] italic leading-relaxed">
              {quote.q}
            </blockquote>
            <footer className="mt-3 text-sm text-text-muted">
              — {quote.a}
            </footer>
          </div>
        </div>
        <p className="mt-4 text-xs text-text-subtle">
          Inspirational quotes provided by{" "}
          <a
            href="https://zenquotes.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline"
          >
            ZenQuotes API
          </a>
        </p>
      </div>
    </section>
  );
}

