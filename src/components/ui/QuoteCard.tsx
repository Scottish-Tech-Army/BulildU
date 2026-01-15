"use client";

import { Quote as QuoteIcon } from "lucide-react";

interface QuoteCardProps {
  quote: string;
  author: string;
  className?: string;
}

/**
 * QuoteCard - Displays an inspirational quote with author attribution
 * 
 * A simpler, static version of DailyQuote for use in wizards and forms.
 */
export function QuoteCard({ quote, author, className = "" }: QuoteCardProps) {
  return (
    <div className={`bg-warm-ivory rounded-2xl py-6 px-6 ${className}`}>
      <div className="flex gap-4">
        <QuoteIcon className="w-6 h-6 text-brand-primary flex-shrink-0 mt-1" fill="currentColor" />
        <div>
          <blockquote className="text-[var(--color-charcoal)] italic leading-relaxed">
            {quote}
          </blockquote>
          <footer className="mt-2 text-sm text-text-muted">
            — {author}
          </footer>
        </div>
      </div>
    </div>
  );
}
